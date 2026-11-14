/**
 * Host half of the AI price radar bundle: serves the aggregated offer feed of
 * public card-shop price sources over one local HTTP prefix. Collection runs
 * in this process (no browser CORS issues, no third-party relay); results are
 * cached in memory. The Client panel fetches `/leida/api/offers` same-origin.
 */
import { getAggregate } from './lib/collectors.js'

const API_PREFIX = '/leida/api'

/** Provides no model-facing behavior; the HTTP routes and the Client panel own the feature. */
export function apply(ctx) {
  ctx.inject(['webServer'], (webCtx) => {
    const route = {
      kind: 'prefix',
      path: API_PREFIX,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url, 'http://leida.local')
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ error: 'method not allowed' }))
            return
          }
          const path = url.pathname
          if (path === `${API_PREFIX}/health`) {
            const body = JSON.stringify({ ok: true, source: 'ai-price-radar' })
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(req.method === 'HEAD' ? undefined : body)
            return
          }
          if (path === `${API_PREFIX}/offers`) {
            const force = url.searchParams.get('force') === '1'
            const snapshot = await getAggregate(force)
            // Flatten per-source offers into one deduplicated row list for the panel.
            const seen = new Set()
            const rows = []
            for (const source of snapshot.sources) {
              for (const offer of source.offers) {
                if (seen.has(offer.dedupeKey)) continue
                seen.add(offer.dedupeKey)
                rows.push(offer)
              }
            }
            const body = JSON.stringify({
              fetchedAt: new Date().toISOString(),
              cached: snapshot.cached,
              cachedAt: snapshot.cachedAt,
              sources: snapshot.sources.map(s => ({ source: s.source, label: s.label, count: s.offers.length, failed: false })),
              errors: snapshot.errors,
              rows,
            })
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(req.method === 'HEAD' ? undefined : body)
            return
          }
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ error: 'not found' }))
        } catch (error) {
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        }
      },
    }
    const disposeRoute = webCtx.webServer.register(route)
    // Dual ownership: the webServer row and this plugin both remove the route.
    ctx.effect(() => () => { disposeRoute() }, 'ai-price-radar: http routes')
  })
}

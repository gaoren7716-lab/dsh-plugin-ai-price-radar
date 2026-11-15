/**
 * Host half of the AI price radar bundle: serves the aggregated offer feed of
 * public card-shop price sources over one local HTTP prefix. Collection runs
 * in this process (no browser CORS issues, no third-party relay); results are
 * cached in memory. The Client panel fetches `/leida/api/offers` same-origin.
 */
import { gzipSync } from 'node:zlib'
import { getAggregate } from './lib/collectors.js'

const API_PREFIX = '/leida/api'

/** Canonical product identity across sources: same merchant URL = same item. */
function groupKey(url) {
  return String(url || '').replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase()
}

function send(res, status, body, acceptEncoding = '', method = 'GET') {
  const raw = Buffer.from(body)
  const useGzip = /\bgzip\b/i.test(acceptEncoding) && raw.byteLength > 32 * 1024
  const payload = useGzip ? gzipSync(raw, { level: 6 }) : raw
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    vary: 'Accept-Encoding',
    ...(useGzip ? { 'content-encoding': 'gzip' } : {}),
  })
  res.end(method === 'HEAD' ? undefined : payload)
}

/** Provides no model-facing behavior; the HTTP routes and the Client panel own the feature. */
export function apply(ctx) {
  ctx.inject(['webServer'], (webCtx) => {
    const route = {
      kind: 'prefix',
      path: API_PREFIX,
      handler: async (req, res) => {
        const acceptEncoding = req.headers['accept-encoding'] || ''
        try {
          const url = new URL(req.url, 'http://leida.local')
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            send(res, 405, JSON.stringify({ error: 'method not allowed' }), acceptEncoding, req.method)
            return
          }
          const path = url.pathname
          if (path === `${API_PREFIX}/health`) {
            send(res, 200, JSON.stringify({ ok: true, source: 'ai-price-radar' }), acceptEncoding, req.method)
            return
          }
          if (path === `${API_PREFIX}/offers`) {
            const force = url.searchParams.get('force') === '1'
            const snapshot = await getAggregate(force)
            // Flatten per-source offers into one deduplicated row list.
            const seen = new Set()
            const rows = []
            for (const source of snapshot.sources) {
              for (const offer of source.offers) {
                if (seen.has(offer.dedupeKey)) continue
                seen.add(offer.dedupeKey)
                rows.push(offer)
              }
            }

            // Same-item aggregation: one merchant URL seen by several sources
            // becomes a comparable group with a real price spread.
            const byUrl = new Map()
            for (const o of rows) {
              const key = groupKey(o.url)
              if (!key) continue
              let g = byUrl.get(key)
              if (!g) { g = { url: key, title: o.title, quotes: [] }; byUrl.set(key, g) }
              g.quotes.push({ source: o.source, price: o.price, store: o.store, stock: o.stock, url: o.url })
              if (o.title.length < g.title.length) g.title = o.title
            }
            const groups = []
            for (const g of byUrl.values()) {
              // One merchant link can carry several SKUs inside a single source
              // (e.g. OpenPrice lists ¥100/¥1000/¥2000 for the same URL).
              // Compare each source's CHEAPEST quote only, so a spread means a
              // real cross-source difference rather than intra-source variants.
              const bestBySource = new Map()
              for (const q of g.quotes) {
                const prev = bestBySource.get(q.source)
                if (prev === undefined || q.price < prev.price) bestBySource.set(q.source, q)
              }
              const quotes = [...bestBySource.values()].sort((a, b) => a.price - b.price)
              if (quotes.length < 2) continue
              const prices = quotes.map(q => q.price)
              const min = Math.min(...prices)
              const max = Math.max(...prices)
              groups.push({
                url: g.url,
                title: g.title,
                count: quotes.length,
                sources: quotes.map(q => q.source),
                min, max,
                spread: Number((max - min).toFixed(2)),
                savePct: max > 0 ? Number(((max - min) / max * 100).toFixed(1)) : 0,
                bestSource: quotes[0]?.source || '',
                bestStore: quotes[0]?.store || '',
                // A sub-¥1 quote beside a ¥1000+ one is usually a引流/测试价
                // rather than a real comparable offer; flag it for the UI.
                suspicious: min < 1 && max > 20,
                quotes,
              })
            }
            groups.sort((a, b) => b.spread - a.spread || b.count - a.count)
            const countByUrl = new Map(groups.map(g => [g.url, g.count]))
            for (const o of rows) o.groupCount = countByUrl.get(groupKey(o.url)) || 0

            const body = JSON.stringify({
              fetchedAt: new Date().toISOString(),
              cached: snapshot.cached,
              cachedAt: snapshot.cachedAt,
              sources: snapshot.sources.map(s => ({
                source: s.source,
                label: s.label,
                count: s.offers.length,
                // A source that yielded nothing (or reported a cooldown/failure)
                // is NOT successful — the panel must show it honestly.
                failed: !(s.offers.length > 0) || (Array.isArray(s.failures) && s.failures.length > 0),
                failures: s.failures || [],
              })),
              errors: snapshot.errors,
              shopSales: snapshot.shopSales || [],
              groups,
              rows,
            })
            send(res, 200, body, acceptEncoding, req.method)
            return
          }
          send(res, 404, JSON.stringify({ error: 'not found' }), acceptEncoding, req.method)
        } catch (error) {
          send(res, 500, JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), acceptEncoding, req.method)
        }
      },
    }
    const disposeRoute = webCtx.webServer.register(route)
    // Dual ownership: the webServer row and this plugin both remove the route.
    ctx.effect(() => () => { disposeRoute() }, 'ai-price-radar: http routes')
  })
}

/**
 * Client half of the AI price radar: registers one global main panel (the
 * comparison page) plus its sidebar entry, mirroring how the shipped Plugins
 * page mounts into the root `main` keyed slot.
 */
window.__ModuleLoader__.load({
  id: '@local/ai-price-radar',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const PANEL_ID = 'ai-price-radar'

    /* ---------------------------------------------------------- styles ---- */
    // Scoped class prefix `radar-`; colors ride the host theme tokens with a
    // fixed dark-radar accent for the price/action colors like the artwork.
    const cssText = `
.radar-page{display:flex;flex-direction:column;min-height:0;height:100%;overflow-y:auto;
  padding:calc(var(--dsh-frame-top-clearance,0px) + 16px) 24px 32px;
  background:var(--dsw-alias-bg-canvas,#0d1117);color:var(--dsw-alias-label-primary,#e6edf3);
  font-size:var(--dsh-content-font-size,14px);box-sizing:border-box;}
.radar-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;}
.radar-title-row{display:flex;align-items:center;gap:10px;}
.radar-dot{width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.15);}
.radar-title{font-size:20px;font-weight:700;letter-spacing:.2px;}
.radar-badge{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l3,#2d3b45);color:var(--dsw-alias-label-secondary,#8b98a5);}
.radar-sub{margin-top:6px;font-size:12px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-mode{font-size:12px;color:var(--dsw-alias-label-secondary,#8b98a5);border:1px solid var(--dsw-alias-border-l3,#2d3b45);border-radius:999px;padding:4px 12px;white-space:nowrap;}
.radar-search{margin-top:16px;background:var(--dsw-alias-bg-module-platform,#161b22);border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:12px;padding:16px;}
.radar-search-row{display:flex;gap:10px;}
.radar-input{flex:1;min-width:160px;background:var(--dsw-alias-field-bg,#0d1117);border:1px solid var(--dsw-alias-border-l3,#2d3b45);border-radius:8px;
  padding:9px 12px;color:inherit;font-size:14px;outline:none;}
.radar-input:focus{border-color:var(--dsw-alias-state-business-primary,#4d6bfe);}
.radar-btn{background:var(--dsw-alias-state-business-primary,#4d6bfe);color:#fff;border:none;border-radius:8px;padding:9px 18px;
  font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;}
.radar-btn:hover{filter:brightness(1.1);}
.radar-btn[disabled]{opacity:.5;cursor:default;}
.radar-filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:14px;}
.radar-field{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-select{background:var(--dsw-alias-field-bg,#0d1117);border:1px solid var(--dsw-alias-border-l3,#2d3b45);border-radius:8px;
  padding:8px 10px;color:var(--dsw-alias-label-primary,#e6edf3);font-size:13px;outline:none;cursor:pointer;}
.radar-stats{display:flex;gap:28px;margin-top:18px;align-items:flex-end;flex-wrap:wrap;}
.radar-stat{display:flex;flex-direction:column;gap:2px;}
.radar-stat b{font-size:22px;font-weight:700;color:var(--dsw-alias-label-primary,#e6edf3);}
.radar-stat span{font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-stat .price{color:#f97316;}
.radar-meta{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);text-align:right;}
.radar-warn{margin-top:10px;font-size:12px;color:#f59e0b;}
.radar-section{margin-top:26px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.radar-section h3{margin:0;font-size:15px;font-weight:700;}
.radar-sort{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-grid{margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:12px;}
@media (max-width:520px){.radar-grid{grid-template-columns:1fr;}}
.radar-card{background:var(--dsw-alias-bg-module-platform,#161b22);border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:12px;padding:14px 16px;
  display:flex;flex-direction:column;gap:8px;transition:border-color .15s;}
.radar-card:hover{border-color:var(--dsw-alias-border-l4,#3d4b57);}
.radar-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}
.radar-chip{font-size:11px;padding:2px 8px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover,#1f2630);color:var(--dsw-alias-label-secondary,#8b98a5);}
.radar-chip.ok{color:#22c55e;background:rgba(34,197,94,.1);}
.radar-chip.out{color:#ef4444;background:rgba(239,68,68,.1);}
.radar-chip.src{color:#4d6bfe;background:rgba(77,107,254,.1);}
.radar-card-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6edf3);line-height:1.45;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.radar-price{font-size:24px;font-weight:800;color:#f97316;}
.radar-price small{font-size:13px;font-weight:600;margin-right:2px;}
.radar-store{font-size:12px;color:var(--dsw-alias-label-secondary,#8b98a5);}
.radar-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:2px;}
.radar-obs{font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-link{background:rgba(34,197,94,.12);color:#22c55e;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;}
.radar-link:hover{background:rgba(34,197,94,.2);}
.radar-empty{margin-top:40px;text-align:center;color:var(--dsw-alias-label-tertiary,#6e7b87);font-size:13px;}
.radar-doc{margin-top:34px;background:var(--dsw-alias-bg-module-platform,#161b22);border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:12px;padding:16px 18px;}
.radar-doc h4{margin:0 0 10px;font-size:14px;}
.radar-doc ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary,#8b98a5);}
.radar-doc a{color:var(--dsw-alias-state-business-primary,#4d6bfe);text-decoration:none;}
.radar-loading{margin-top:40px;text-align:center;color:var(--dsw-alias-label-tertiary,#6e7b87);font-size:13px;}
`
    // Inject one stylesheet; removed with the plugin.
    let styleEl = null
    function ensureStyles() {
      if (styleEl || typeof document === 'undefined') return
      styleEl = document.createElement('style')
      styleEl.setAttribute('data-ai-price-radar', '')
      styleEl.textContent = cssText
      document.head.appendChild(styleEl)
    }
    function removeStyles() {
      if (styleEl) { styleEl.remove(); styleEl = null }
    }

    /* ----------------------------------------------------------- state ---- */
    const SOURCES = [
      { id: 'biwu', label: 'BiWu.Ai（http://BiWu.Ai）' },
      { id: 'aiprice', label: 'AI价网（http://aiprice.club）' },
      { id: 'catfk', label: '云猫寄售（catfk.com）' },
    ]
    const PLATFORMS = ['全部平台', '链动小铺', '自建站', '云猫寄售', '16688', '独角数卡', '未知']
    const TYPES = ['全部类型', '成品号', '代充', '卡密', '车位', '质保', '未知']
    const SORTS = [
      { id: 'price-asc', label: '价格从低到高' },
      { id: 'price-desc', label: '价格从高到低' },
      { id: 'time-desc', label: '观察时间从新到旧' },
    ]

    function Panel() {
      const [state, setState] = React.useState({
        loading: true, error: null, snapshot: null, query: '',
        source: 'all', stock: 'all', platform: '全部平台', type: '全部类型',
        sort: 'price-asc', page: 1,
      })
      const inputRef = React.useRef(null)
      const PAGE_SIZE = 100

      const load = React.useCallback((force) => {
        setState(s => ({ ...s, loading: true, error: null }))
        fetch(`/leida/api/offers${force ? '?force=1' : ''}`)
          .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
          .then(snapshot => setState(s => ({ ...s, loading: false, snapshot })))
          .catch(error => setState(s => ({ ...s, loading: false, error: String(error.message || error) })))
      }, [])
      React.useEffect(() => { load(false) }, [load])

      const snapshot = state.snapshot
      const rows = snapshot ? snapshot.rows : []
      const filtered = React.useMemo(() => {
        const q = state.query.trim().toLowerCase()
        const out = rows.filter(r => {
          if (state.source !== 'all' && r.source !== state.source) return false
          if (state.stock === 'in' && r.stock !== 'in') return false
          if (state.stock === 'out' && r.stock !== 'out') return false
          if (state.platform !== '全部平台' && r.platform !== state.platform) return false
          if (state.type !== '全部类型' && r.productType !== state.type) return false
          if (q && !(r.title.toLowerCase().includes(q) || r.store.toLowerCase().includes(q))) return false
          return true
        })
        out.sort((a, b) => {
          if (state.sort === 'price-asc') return a.price - b.price
          if (state.sort === 'price-desc') return b.price - a.price
          return String(b.observedAt).localeCompare(String(a.observedAt))
        })
        return out
      }, [rows, state.query, state.source, state.stock, state.platform, state.type, state.sort])

      const pageRows = filtered.slice(0, state.page * PAGE_SIZE)
      const lowest = filtered.length ? Math.min(...filtered.map(r => r.price)) : null
      const markedCount = filtered.filter(r => r.stock === 'in').length
      const okSources = snapshot ? snapshot.sources.filter(s => !s.failed).length : 0
      const totalSources = snapshot ? snapshot.sources.length : 0

      const onSubmit = (e) => {
        e.preventDefault()
        setState(s => ({ ...s, query: inputRef.current ? inputRef.current.value : '', page: 1 }))
      }
      const setField = (key) => (e) => setState(s => ({ ...s, [key]: e.target.value, page: 1 }))

      return h('div', { className: 'radar-page' },
        h('style', null, cssText),
        h('div', { className: 'radar-header' },
          h('div', null,
            h('div', { className: 'radar-title-row' },
              h('span', { className: 'radar-dot' }),
              h('span', { className: 'radar-title' }, 'AI 比价雷达'),
              h('span', { className: 'radar-badge' }, 'DSH 插件'),
            ),
            h('div', { className: 'radar-sub' }, '多源采集 · 同商品筛选 · 原始购买链接 · 独立数据缓存'),
          ),
          h('span', { className: 'radar-mode' }, '本地运行 / 只读采集'),
        ),
        h('form', { className: 'radar-search', onSubmit },
          h('div', { className: 'radar-search-row' },
            h('input', {
              ref: inputRef, className: 'radar-input', placeholder: '搜索商品关键词，如 gpt、claude 质保…',
              defaultValue: state.query,
            }),
            h('button', { className: 'radar-btn', type: 'submit' }, '搜索全网报价'),
          ),
          h('div', { className: 'radar-filters' },
            h('label', { className: 'radar-field' }, '数据来源',
              h('select', { className: 'radar-select', value: state.source, onChange: setField('source') },
                h('option', { value: 'all' }, '全部可用来源'),
                SOURCES.map(s => h('option', { key: s.id, value: s.id }, s.label)),
              ),
            ),
            h('label', { className: 'radar-field' }, '库存口径',
              h('select', { className: 'radar-select', value: state.stock, onChange: setField('stock') },
                h('option', { value: 'all' }, '全部（含未知）'),
                h('option', { value: 'in' }, '标记有货'),
                h('option', { value: 'out' }, '标记缺货'),
              ),
            ),
            h('label', { className: 'radar-field' }, '发卡平台',
              h('select', { className: 'radar-select', value: state.platform, onChange: setField('platform') },
                PLATFORMS.map(p => h('option', { key: p, value: p }, p)),
              ),
            ),
            h('label', { className: 'radar-field' }, '商品/交付类型',
              h('select', { className: 'radar-select', value: state.type, onChange: setField('type') },
                TYPES.map(t => h('option', { key: t, value: t }, t)),
              ),
            ),
          ),
        ),
        h('div', { className: 'radar-stats' },
          h('div', { className: 'radar-stat' }, h('b', null, String(filtered.length)), h('span', null, '主要报价')),
          h('div', { className: 'radar-stat' }, h('b', null, String(markedCount)), h('span', null, '来源标记有货')),
          h('div', { className: 'radar-stat' },
            h('b', { className: 'price' }, lowest !== null ? `¥${formatPrice(lowest)}` : '—'),
            h('span', null, '当前结果最低价'),
          ),
          h('div', { className: 'radar-stat' }, h('b', null, `${okSources}/${totalSources}`), h('span', null, '成功/部分数据源')),
          h('div', { className: 'radar-meta' },
            snapshot ? `查询于 ${new Date(snapshot.fetchedAt || snapshot.cachedAt || Date.now()).toLocaleTimeString()} · 当前页面展示 ${pageRows.length} / ${filtered.length} 条${snapshot.cached ? `（缓存于 ${new Date(snapshot.cachedAt).toLocaleTimeString()}）` : '（来源实时聚合）'}` : '正在加载…',
          ),
        ),
        (snapshot && snapshot.errors && snapshot.errors.length > 0) && h('div', { className: 'radar-warn' },
          '部分来源受限：' + snapshot.errors.map(e => e.source + ' ' + e.message).join('；'),
        ),
        h('div', { className: 'radar-section' },
          h('h3', null, `商品报价 · ${filtered.length} 条（按不同交付类型核对后再比价）`),
          h('label', { className: 'radar-sort' }, '排序：',
            h('select', { className: 'radar-select', value: state.sort, onChange: setField('sort') },
              SORTS.map(s => h('option', { key: s.id, value: s.id }, s.label)),
            ),
          ),
        ),
        state.loading && h('div', { className: 'radar-loading' }, '正在采集多源报价…'),
        state.error && h('div', { className: 'radar-empty' }, `采集失败：${state.error}（点右上刷新或稍后重试）`),
        !state.loading && !state.error && pageRows.length === 0 && h('div', { className: 'radar-empty' }, '没有符合筛选条件的报价；放宽筛选或换个关键词试试。'),
        h('div', { className: 'radar-grid' },
          pageRows.map(r => h(OfferCard, { key: r.dedupeKey, offer: r })),
        ),
        pageRows.length < filtered.length && h('div', { style: { marginTop: '16px', textAlign: 'center' } },
          h('button', { className: 'radar-btn', onClick: () => setState(s => ({ ...s, page: s.page + 1 })) },
            `加载更多（还有 ${filtered.length - pageRows.length} 条）`),
        ),
        h('div', { className: 'radar-doc' },
          h('h4', null, '数据来源与口径'),
          h('ul', null,
            h('li', null, 'BiWu.Ai（http://BiWu.Ai） ——主源。官方只读快照 feed（/price-radar/latest.json → 不可变快照），无需鉴权，按其公开 API 约定带缓存拉取，约 5 分钟一版；本页报价大多覆盖链动小铺（wzyp.cn）发布的实时数据。'),
            h('li', null, 'AI价网（http://aiprice.club） ——补漏源。解析其公开类目报价表；数据遵循 CC BY 4.0，署名「AI价网 (http://aiprice.club)」。'),
            h('li', null, '云猫寄售（catfk.com） ——直连源。经其公开店铺接口（/shopApi/Shop/goodsList，逐店实时抓取）；店铺清单发现自 AI价网的公开店铺目录。'),
            h('li', null, '链动小铺（wzyp.cn） ——数据主源之一，但直抓被其 ESA 人机验证拦截；其报价由 BiWu 与 AI价网 两路覆盖，实时性以聚合源为准。'),
            h('li', null, '水獭（shuifa.xyz） ——本轮未并入：2026-11-13 起实测域名不可达（恢复后可按同架构接入）.'),
            h('li', null, '库存口径：数字 = 库存件数；未知 = 来源未公开库存。同一商品以「平台 + 店铺标识 + 商品标识」为键去重；同一商品同时有直抓与聚合报价时保留直抓行。报价行不重复计数。'),
            h('li', null, '本页只做信息聚合与导航，不参与任何交易；付款前请以商家页面为准。CardNav、PriceAI 依其数据许可仅用于发现店铺与交叉核对，未批量并入。'),
          ),
        ),
      )
    }

    function formatPrice(value) {
      if (typeof value !== 'number' || !isFinite(value)) return '—'
      if (Number.isInteger(value)) return String(value)
      return String(Number(value.toFixed(2)))
    }

    function relTime(iso) {
      const t = Date.parse(iso)
      if (!isFinite(t)) return ''
      const diff = Date.now() - t
      const m = Math.round(diff / 60000)
      if (m < 1) return '刚刚'
      if (m < 60) return `${m} 分钟前`
      const hr = Math.round(m / 60)
      if (hr < 24) return `${hr} 小时前`
      return `${Math.round(hr / 24)} 天前`
    }

    function OfferCard({ offer }) {
      const stockChip = offer.stock === 'in'
        ? h('span', { className: 'radar-chip ok' }, offer.stockCount ? `标记有货 · 库存 ${offer.stockCount}` : '标记有货')
        : offer.stock === 'out'
          ? h('span', { className: 'radar-chip out' }, '缺货')
          : h('span', { className: 'radar-chip' }, '库存未知')
      return h('div', { className: 'radar-card' },
        h('div', { className: 'radar-chips' },
          h('span', { className: 'radar-chip' }, offer.platform),
          h('span', { className: 'radar-chip' }, `来源：${offer.source === 'biwu' ? 'BiWu.Ai' : 'AI价网'}`),
          h('span', { className: 'radar-chip' }, offer.productType),
          stockChip,
        ),
        h('div', { className: 'radar-card-title', title: offer.title }, offer.title),
        h('div', { className: 'radar-price' }, h('small', null, offer.currency), formatPrice(offer.price)),
        h('div', { className: 'radar-store' }, offer.store.startsWith(offer.platform) ? offer.store : `${offer.platform} · ${offer.store}`),
        h('div', { className: 'radar-card-foot' },
          h('span', { className: 'radar-obs' }, offer.observedAt ? `观察：${relTime(offer.observedAt)}` : ''),
          offer.url
            ? h('a', { className: 'radar-link', href: offer.url, target: '_blank', rel: 'noopener noreferrer nofollow' }, '查看原始报价')
            : h('span', { className: 'radar-chip' }, '无直链'),
        ),
      )
    }

    /* -------------------------------------------------------- icon component ---- */
    function PanelIcon() {
      return h('svg', { viewBox: '0 0 24 24', width: 20, height: 20, 'aria-hidden': true },
        h('circle', { cx: 10.5, cy: 10.5, r: 6.5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }),
        h('line', { x1: 15.5, y1: 15.5, x2: 20.5, y2: 20.5, stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' }),
        h('circle', { cx: 10.5, cy: 10.5, r: 2, fill: 'currentColor' }),
        h('path', { d: 'M15 3.5 A 8.5 8.5 0 0 1 20.5 9', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' }),
      )
    }

    return {
      inject: ['slots', 'locale', 'layout'],
      apply(ctx) {
        ctx.effect(() => { ensureStyles(); return removeStyles }, 'ai-price-radar: styles')
        // Dictionaries for the sidebar label through the shared locale service.
        ctx.effect(() => ctx.locale.register('aiPriceRadar', {
          zh: { panel: 'AI 比价雷达' },
          en: { panel: 'AI price radar' },
        }), 'ai-price-radar: dictionaries')
        const t = ctx.locale.bind('aiPriceRadar')
        const label = () => { try { return t('panel') } catch { return 'AI 比价雷达' } }
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: 'aiPriceRadar',
          label,
        }, Panel))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 60,
          label,
          locale: 'aiPriceRadar',
        }, PanelIcon))
      },
    }
  },
})

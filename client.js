/**
 * Client half of the AI price radar: registers one global main panel (the
 * comparison page) plus its sidebar entry, mirroring how the shipped Plugins
 * page mounts into the root `main` keyed slot.
 */
window.__ModuleLoader__.load({
  id: 'dsh-plugin-ai-price-radar',
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
.radar-tabs{display:flex;gap:6px;margin-top:18px;border-bottom:1px solid var(--dsw-alias-border-l2,#212933);}
.radar-tab{background:none;border:none;border-bottom:2px solid transparent;padding:9px 16px;font-size:13px;font-weight:600;
  color:var(--dsw-alias-label-tertiary,#6e7b87);cursor:pointer;white-space:nowrap;}
.radar-tab:hover{color:var(--dsw-alias-label-primary,#e6edf3);}
.radar-tab.active{color:var(--dsw-alias-state-business-primary,#4d6bfe);border-bottom-color:var(--dsw-alias-state-business-primary,#4d6bfe);}
.radar-board{margin-top:14px;display:flex;flex-direction:column;gap:10px;}
.radar-rank{background:var(--dsw-alias-bg-module-platform,#161b22);border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:10px;
  padding:12px 14px;display:flex;align-items:center;gap:14px;}
.radar-rank-no{width:30px;min-width:30px;text-align:center;font-size:16px;font-weight:800;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-rank-no.top{color:#f59e0b;}
.radar-rank-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;}
.radar-rank-name{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6edf3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.radar-rank-sub{font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);display:flex;gap:10px;flex-wrap:wrap;}
.radar-rank-num{text-align:right;min-width:96px;display:flex;flex-direction:column;gap:2px;}
.radar-rank-num b{font-size:17px;font-weight:800;color:#f97316;}
.radar-rank-num span{font-size:10px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-bar{height:5px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover,#1f2630);overflow:hidden;}
.radar-bar > i{display:block;height:100%;background:linear-gradient(90deg,#4d6bfe,#22c55e);border-radius:3px;}
.radar-rank-actions{display:flex;gap:6px;align-items:center;}
.radar-mini{background:rgba(77,107,254,.12);color:var(--dsw-alias-state-business-primary,#4d6bfe);border:none;border-radius:6px;
  padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;}
.radar-mini:hover{background:rgba(77,107,254,.22);}
.radar-board-title{margin:0 0 4px;font-size:14px;font-weight:700;}
.radar-board-note{font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);line-height:1.6;margin:0 0 8px;}
.radar-subhead{margin:18px 0 8px;font-size:13px;font-weight:700;color:var(--dsw-alias-label-secondary,#8b98a5);}
.radar-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;}
.radar-cat{background:var(--dsw-alias-bg-module-platform,#161b22);border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:12px;padding:14px;}
.radar-cat h5{margin:0 0 8px;font-size:14px;font-weight:700;display:flex;justify-content:space-between;align-items:center;}
.radar-cat h5 em{font-style:normal;font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);font-weight:500;}
.radar-cat-metrics{display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-cat-metrics b{display:block;font-size:16px;color:var(--dsw-alias-label-primary,#e6edf3);font-weight:700;}
.radar-cat-metrics b.orange{color:#f97316;}
.radar-cat-bar{margin-top:10px;}
.radar-cat-foot{margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;}
.radar-cat-shop{font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.radar-clickable{cursor:pointer;transition:border-color .15s,transform .1s;}
.radar-clickable:hover{border-color:var(--dsw-alias-state-business-primary,#4d6bfe);transform:translateY(-1px);}
.radar-crumb{display:flex;align-items:center;gap:8px;margin-top:16px;padding:10px 14px;background:var(--dsw-alias-bg-module-platform,#161b22);
  border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:10px;font-size:12px;flex-wrap:wrap;}
.radar-crumb button{background:none;border:none;color:var(--dsw-alias-state-business-primary,#4d6bfe);font-size:12px;cursor:pointer;padding:2px 4px;}
.radar-crumb button:hover{text-decoration:underline;}
.radar-crumb span.sep{color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-crumb span.cur{color:var(--dsw-alias-label-primary,#e6edf3);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:420px;}
.radar-detail-head{margin-top:14px;background:var(--dsw-alias-bg-module-platform,#161b22);border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:12px;padding:16px;}
.radar-detail-head h3{margin:0 0 4px;font-size:18px;font-weight:700;}
.radar-detail-head p{margin:0;font-size:12px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-detail-metrics{display:flex;gap:24px;margin-top:14px;flex-wrap:wrap;}
.radar-detail-metrics div{font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);}
.radar-detail-metrics b{display:block;font-size:20px;font-weight:800;color:var(--dsw-alias-label-primary,#e6edf3);}
.radar-detail-metrics b.orange{color:#f97316;}
.radar-detail-list{margin-top:12px;display:flex;flex-direction:column;gap:8px;}
.radar-detail-row{background:var(--dsw-alias-bg-module-platform,#161b22);border:1px solid var(--dsw-alias-border-l2,#212933);border-radius:10px;
  padding:11px 13px;display:flex;align-items:center;gap:12px;}
.radar-detail-row .rd-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.radar-detail-row .rd-title{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.radar-detail-row .rd-sub{font-size:11px;color:var(--dsw-alias-label-tertiary,#6e7b87);display:flex;gap:10px;flex-wrap:wrap;}
.radar-detail-row .rd-price{font-size:16px;font-weight:800;color:#f97316;white-space:nowrap;min-width:78px;text-align:right;}
.radar-detail-row .rd-price.best{color:#22c55e;}
.radar-rel{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;}
.radar-rel button{background:var(--dsw-alias-interactive-bg-hover,#1f2630);border:1px solid var(--dsw-alias-border-l3,#2d3b45);
  color:var(--dsw-alias-label-secondary,#8b98a5);border-radius:999px;padding:5px 12px;font-size:11px;cursor:pointer;}
.radar-rel button:hover{color:var(--dsw-alias-state-business-primary,#4d6bfe);border-color:var(--dsw-alias-state-business-primary,#4d6bfe);}
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
      { id: 'openprice', label: 'OpenPrice（openprice.cc）' },
      { id: 'zhitu', label: '知途·拾价（price.yufu.pub）' },
      { id: 'priceai', label: 'PriceAI（priceai.cc）' },
      { id: 'aifeeradar', label: 'AIFeeRadar（aifeeradar.com）' },
    ]
    const SOURCE_NAMES = Object.fromEntries(SOURCES.map(s => [s.id, s.label.replace(/（.*$/, '').trim()]))
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
        category: '全部类目', tab: 'offers', sort: 'price-asc', page: 1,
        detail: null,
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
      const categories = React.useMemo(() => {
        const names = [...new Set(rows.map(r => r.category).filter(Boolean))].sort()
        return ['全部类目', ...names]
      }, [rows])
      const filtered = React.useMemo(() => {
        const q = state.query.trim().toLowerCase()
        const out = rows.filter(r => {
          if (state.source !== 'all' && r.source !== state.source) return false
          if (state.stock === 'in' && r.stock !== 'in') return false
          if (state.stock === 'out' && r.stock !== 'out') return false
          if (state.platform !== '全部平台' && r.platform !== state.platform) return false
          if (state.type !== '全部类型' && r.productType !== state.type) return false
          if (state.category !== '全部类目' && r.category !== state.category) return false
          if (q && !(r.title.toLowerCase().includes(q) || r.store.toLowerCase().includes(q))) return false
          return true
        })
        out.sort((a, b) => {
          if (state.sort === 'price-asc') return a.price - b.price
          if (state.sort === 'price-desc') return b.price - a.price
          return String(b.observedAt).localeCompare(String(a.observedAt))
        })
        return out
      }, [rows, state.query, state.source, state.stock, state.platform, state.type, state.category, state.sort])

      const pageRows = filtered.slice(0, state.page * PAGE_SIZE)
      const lowest = filtered.length ? Math.min(...filtered.map(r => r.price)) : null
      const markedCount = filtered.filter(r => r.stock === 'in').length
      const okSources = snapshot ? snapshot.sources.filter(s => !s.failed).length : 0
      const totalSources = snapshot ? snapshot.sources.length : 0
      const sourceFailures = snapshot ? snapshot.sources.flatMap(s => (s.failures || []).map(f => `${s.label || s.source}：${f}`)) : []

      const onSubmit = (e) => {
        e.preventDefault()
        setState(s => ({ ...s, query: inputRef.current ? inputRef.current.value : '', page: 1 }))
      }
      const setField = (key) => (e) => setState(s => ({ ...s, [key]: e.target.value, page: 1 }))
      const setTab = (tab) => setState(s => ({ ...s, tab, detail: null }))
      const pickCategory = (name) => setState(s => ({ ...s, category: name, tab: 'offers', page: 1, query: '', detail: null }))
      const openDetail = (type, key, label, fromTab) => setState(s => ({ ...s, detail: { type, key, label, fromTab: fromTab || s.tab } }))
      const closeDetail = () => setState(s => ({ ...s, detail: null }))

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
            h('label', { className: 'radar-field' }, '商品类目',
              h('select', { className: 'radar-select', value: state.category, onChange: setField('category') },
                categories.map(c => h('option', { key: c, value: c }, c)),
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
        ((snapshot && snapshot.errors && snapshot.errors.length > 0) || sourceFailures.length > 0) && h('div', { className: 'radar-warn' },
          '部分来源受限：' + [
            ...(snapshot ? snapshot.errors.map(e => e.source + ' ' + e.message) : []),
            ...sourceFailures,
          ].join('；'),
        ),
        state.detail && h(DetailView, {
          detail: state.detail, rows, groups: snapshot ? (snapshot.groups || []) : [],
          shopSales: snapshot ? (snapshot.shopSales || []) : [],
          onBack: closeDetail, openDetail, pickCategory, onTab: setTab,
        }),
        // TOP sites keep global navigation visible on detail pages: the tab bar
        // stays mounted, and picking any tab closes the current detail view.
        h('div', { className: 'radar-tabs' },
          [['offers', '报价卡片'], ['categories', '分类榜单'], ['hot', '销售热榜'], ['same', '同款比价']].map(([id, label]) =>
            h('button', {
              key: id, type: 'button',
              className: `radar-tab${!state.detail && state.tab === id ? ' active' : ''}${state.detail && state.detail.fromTab === id ? ' active' : ''}`,
              onClick: () => setTab(id),
            }, label),
          ),
        ),
        !state.detail && state.tab === 'offers' && h(OffersView, {
          state, filtered, pageRows, setField, openDetail,
          onLoadMore: () => setState(s => ({ ...s, page: s.page + 1 })),
        }),
        !state.detail && state.tab === 'categories' && h(CategoryBoard, { rows, onPick: pickCategory, openDetail }),
        !state.detail && state.tab === 'hot' && h(HotBoard, { rows, shopSales: snapshot ? (snapshot.shopSales || []) : [], openDetail }),
        !state.detail && state.tab === 'same' && h(SameItemBoard, { groups: snapshot ? (snapshot.groups || []) : [], openDetail }),
        h('div', { className: 'radar-doc' },
          h('h4', null, '数据来源与口径'),
          h('ul', null,
            h('li', null, 'BiWu.Ai（http://BiWu.Ai） ——主源。官方只读快照 feed（/price-radar/latest.json → 不可变快照），无需鉴权，按其公开 API 约定带缓存拉取，约 5 分钟一版；本页报价大多覆盖链动小铺（wzyp.cn）发布的实时数据。'),
            h('li', null, 'AI价网（http://aiprice.club） ——补漏源。解析其公开类目报价表；数据遵循 CC BY 4.0，署名「AI价网 (http://aiprice.club)」。'),
            h('li', null, '云猫寄售（catfk.com） ——直连源。经其公开店铺接口（/shopApi/Shop/goodsList，逐店实时抓取）；店铺清单发现自 AI价网的公开店铺目录。'),
            h('li', null, 'OpenPrice（https://www.openprice.cc） ——量最大源（1.8 万+ 条）。读取其全量商品页内嵌的公开数据（initialItems），含 344 家店铺、18 个类目；站点 robots 全站开放。'),
            h('li', null, '知途·拾价（https://price.yufu.pub） ——公开 catalog API（robots.txt 明确白名单 /api/catalog），1100+ 商品 3700+ 报价，含店铺评分与验价状态。'),
            h('li', null, 'PriceAI（https://priceai.cc） 与 AIFeeRadar（https://aifeeradar.com） ——与 BiWu.Ai 同一 price-radar.v1 官方快照 feed 家族（各自 /.well-known/price-radar.json 发现，按其 API 约定带缓存拉取）。'),
            h('li', null, '链动小铺（wzyp.cn） ——数据主源之一，但直抓被其 ESA 人机验证拦截；其报价由 BiWu、AI价网、知途、OpenPrice 四路覆盖，实时性以聚合源为准。'),
            h('li', null, '水獭（shuifa.xyz） ——本轮未并入：2026-11-13 起实测域名不可达（恢复后可按同架构接入）.'),
            h('li', null, '榜单下钻：分类卡片、店铺销量行、商品已售行、同款比价行、报价卡片均可点击进去查看详情（面包屑 + 返回 + 各来源报价表 + 去原站直链 + 类目/店铺交叉导航），交互参照 BiWu、AI价网、知途的详情页习惯。'),
            h('li', null, '同款比价：按商家原始购买链接归并，同一链接被多个来源收录时每个来源只取最低价（避免同店不同规格误判），展示真实跨源价差与可省金额；疑似引流价（¥1 以下对 ¥20 以上）单独排除。'),
            h('li', null, '分类榜单：把七源的细分类目统一归入 12 个 AI 货架（ChatGPT / Claude / Gemini / Grok / 邮箱账号 / 接码验证 / API 中转 等）；报价数=供给规模，最低/中位价=当前结果价格带，店铺数=活跃店铺。'),
            h('li', null, '销售热榜：店铺累计销量取自 AI价网公开「店铺销量」标签与云猫寄售 Shop/info 的 sell_count（已按店铺去重、冲突取较大值）；商品「已售」取自标题标注；供给热度按店铺收录报价数排序，明确非销量。均为商家公开的历史累计口径，非本插件成交数据。'),
            h('li', null, '库存口径：数字 = 库存件数；未知 = 来源未公开库存。同一商品以「平台 + 店铺标识 + 商品标识」为键去重；同一商品同时有直抓与聚合报价时保留直抓行。报价行不重复计数。'),
            h('li', null, '本页只做信息聚合与导航，不参与任何交易；付款前请以商家页面为准。'),
          ),
        ),
      )
    }

    /** Tab 4: same-item cross-source comparison — the real "比价" view. */
    function SameItemBoard({ groups, openDetail }) {
      const withSpread = groups.filter(g => g.spread > 0 && !g.suspicious)
      const suspiciousCount = groups.filter(g => g.spread > 0 && g.suspicious).length
      const maxSpread = withSpread.reduce((m, g) => Math.max(m, g.spread), 1)
      const totalSave = withSpread.reduce((n, g) => n + g.spread, 0)
      return h('div', null,
        h('div', { className: 'radar-board' },
          h('h4', { className: 'radar-board-title' }, '同款比价 · 同一商品在不同来源的价差'),
          h('p', { className: 'radar-board-note' },
            `按商家原始购买链接归并：${groups.length} 款商品被 2 个以上来源收录，其中 ${withSpread.length} 款存在真实价差，合计可省 ¥${formatPrice(totalSave)}。每个来源只取该链接的最低价（避免同店不同规格误判）；另排除 ${suspiciousCount} 款疑似引流价（¥1 以下对 ¥20 以上）。价格为各来源采集时的公开报价，付款前请回原站核对。`),
        ),
        withSpread.length === 0 && h('div', { className: 'radar-empty' }, '本轮没有发现跨来源有价差的同款商品。'),
        withSpread.slice(0, 60).map((g, i) => h('div', { className: 'radar-rank radar-clickable', key: g.url + i,
          onClick: () => openDetail('item', g.url, g.title, 'same') },
          h('span', { className: `radar-rank-no${i < 3 ? ' top' : ''}` }, String(i + 1)),
          h('div', { className: 'radar-rank-main' },
            h('span', { className: 'radar-rank-name', title: g.title }, g.title),
            h('span', { className: 'radar-rank-sub' },
              h('span', null, `${g.sources.length} 个来源`),
              h('span', null, `最低 ${SOURCE_NAMES[g.bestSource] || g.bestSource} · ${g.bestStore}`),
              h('span', null, `¥${formatPrice(g.min)} → ¥${formatPrice(g.max)}`),
            ),
            h('div', { className: 'radar-bar' }, h('i', { style: { width: `${Math.max(2, (g.spread / maxSpread) * 100)}%` } })),
          ),
          h('div', { className: 'radar-rank-num' },
            h('b', null, `¥${formatPrice(g.spread)}`),
            h('span', null, `可省 ${g.savePct}%`),
          ),
          h('div', { className: 'radar-rank-actions' },
            g.url && h('a', { className: 'radar-link', href: g.url, target: '_blank', rel: 'noopener noreferrer nofollow',
              onClick: (e) => e.stopPropagation() }, '去原站'),
          ),
        )),
      )
    }

    function formatPrice(value) {
      if (typeof value !== 'number' || !isFinite(value)) return '—'
      if (Number.isInteger(value)) return String(value)
      return String(Number(value.toFixed(2)))
    }

    function compactNumber(n) {
      if (!isFinite(n)) return '—'
      if (n >= 10000) return `${Number((n / 10000).toFixed(1))} 万`
      return String(n)
    }

    /**
     * Drill-down detail view. Borrows the TOP sites' shared pattern:
     * breadcrumb + back, headline metrics, a price/comparison table with stock
     * badges and outbound buy links, and cross-navigation to related
     * categories/shops. Rendered in-page (not a modal) so the host theme,
     * scrolling and focus behaviour stay intact.
     */
    function DetailView({ detail, rows, groups, shopSales, onBack, openDetail, pickCategory, onTab }) {
      const { type, key, label } = detail
      const content = React.useMemo(() => {
        if (type === 'shop') {
          const shopRows = rows.filter(r => (r.store || '').trim().toLowerCase() === key.trim().toLowerCase()
            || (r.store || '').toLowerCase().includes(key.toLowerCase()))
          const sales = shopSales.find(s => (s.shop || '').trim().toLowerCase() === key.trim().toLowerCase())
          const cats = [...new Set(shopRows.map(r => r.category).filter(Boolean))]
          return { kind: 'shop', shopRows, sales, cats }
        }
        if (type === 'item') {
          const g = groups.find(x => x.url === key)
          const itemRows = g ? rows.filter(r => groupKeyOf(r.url) === key) : rows.filter(r => r.dedupeKey === key || r.url === key)
          return { kind: 'item', group: g, itemRows }
        }
        const catRows = rows.filter(r => r.category === key)
        const byShop = new Map()
        for (const r of catRows) byShop.set(r.store, (byShop.get(r.store) || 0) + 1)
        return { kind: 'category', catRows, topShops: [...byShop.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10) }
      }, [type, key, rows, groups, shopSales])

      const allRows = content.shopRows || content.itemRows || content.catRows || []
      const prices = allRows.map(r => r.price).sort((a, b) => a - b)
      const min = prices[0]
      const median = prices[Math.floor(prices.length / 2)]
      const inStock = allRows.filter(r => r.stock === 'in').length
      const title = type === 'category' ? `${key} · 品类详情` : label
      const subtitle = type === 'shop'
        ? '该店铺在七源的公开报价、销量与品类分布'
        : type === 'item'
          ? '同一商品在各来源的公开报价对比'
          : '该品类的价格带、活跃店铺与最低价商品'

      const listRows = [...allRows].sort((a, b) => a.price - b.price).slice(0, 40)
      const bestPrice = min

      return h('div', null,
        h('div', { className: 'radar-crumb' },
          h('button', { type: 'button', onClick: onBack }, '← 返回榜单'),
          h('span', { className: 'sep' }, '/'),
          h('button', { type: 'button', onClick: () => onTab(detail.fromTab || 'hot') }, detail.fromTab === 'categories' ? '分类榜单' : detail.fromTab === 'same' ? '同款比价' : detail.fromTab === 'offers' ? '报价卡片' : '销售热榜'),
          h('span', { className: 'sep' }, '/'),
          h('span', { className: 'cur', title: label }, label),
        ),
        h('div', { className: 'radar-detail-head' },
          h('h3', null, title),
          h('p', null, subtitle),
          h('div', { className: 'radar-detail-metrics' },
            h('div', null, h('b', null, String(allRows.length)), '收录报价'),
            h('div', null, h('b', null, String(inStock)), '标记有货'),
            h('div', null, h('b', { className: 'orange' }, min !== undefined ? `¥${formatPrice(min)}` : '—'), '最低价'),
            h('div', null, h('b', null, median !== undefined ? `¥${formatPrice(median)}` : '—'), '中位价'),
            content.kind === 'shop' && content.sales && h('div', null, h('b', null, compactNumber(content.sales.sales)), '累计销量(公开)'),
            content.kind === 'item' && content.group && h('div', null, h('b', { className: 'orange' }, `¥${formatPrice(content.group.spread)}`), '跨源价差'),
          ),
        ),
        content.kind === 'item' && content.group && h('div', { className: 'radar-board', style: { marginTop: '12px' } },
          h('h4', { className: 'radar-board-title' }, '各来源报价（每源取最低）'),
          h('div', { className: 'radar-detail-list' },
            content.group.quotes.map((q, i) => h('div', { className: 'radar-detail-row', key: q.source + i },
              h('div', { className: 'rd-main' },
                h('span', { className: 'rd-title' }, SOURCE_NAMES[q.source] || q.source),
                h('span', { className: 'rd-sub' }, h('span', null, q.store), h('span', null, q.stock === 'in' ? '有货' : q.stock === 'out' ? '缺货' : '库存未知')),
              ),
              h('span', { className: `rd-price${q.price === bestPrice ? ' best' : ''}` }, `¥${formatPrice(q.price)}`),
              q.url && h('a', { className: 'radar-link', href: q.url, target: '_blank', rel: 'noopener noreferrer nofollow' }, '去原站'),
            )),
          ),
        ),
        h('h4', { className: 'radar-subhead' }, content.kind === 'shop' ? '该店报价（按价格升序）' : content.kind === 'item' ? '该商品在全部来源的报价明细' : '该类目最低价商品'),
        listRows.length < allRows.length && h('p', { className: 'radar-board-note' }, `共 ${allRows.length} 条，下列展示价格最低的 ${listRows.length} 条；其余可用「查看该类报价」在报价卡片里继续筛选。`),
        h('div', { className: 'radar-detail-list' },
          listRows.map((r, i) => h('div', { className: 'radar-detail-row radar-clickable', key: r.dedupeKey + i,
            onClick: () => openDetail('item', r.url || r.dedupeKey, r.title, 'offers') },
            h('div', { className: 'rd-main' },
              h('span', { className: 'rd-title', title: r.title }, r.title),
              h('span', { className: 'rd-sub' },
                h('span', null, r.store),
                h('span', null, SOURCE_NAMES[r.source] || r.source),
                h('span', null, r.category || ''),
                h('span', null, r.stock === 'in' ? '有货' : r.stock === 'out' ? '缺货' : '库存未知'),
                r.observedAt && h('span', null, relTime(r.observedAt)),
              ),
            ),
            h('span', { className: `rd-price${r.price === bestPrice ? ' best' : ''}` }, `¥${formatPrice(r.price)}`),
            r.url && h('a', { className: 'radar-link', href: r.url, target: '_blank', rel: 'noopener noreferrer nofollow',
              onClick: (e) => e.stopPropagation() }, '去原站'),
          )),
        ),
        // Cross-navigation: TOP sites always link category <-> shop both ways.
        h('h4', { className: 'radar-subhead' }, content.kind === 'category' ? '该类目活跃店铺（点击查看店铺详情）' : '相关导航'),
        h('div', { className: 'radar-rel' },
          content.kind === 'shop' && (content.cats || []).map(c => h('button', { key: c, type: 'button', onClick: () => pickCategory(c) }, `类目：${c}`)),
          content.kind === 'shop' && h('button', { type: 'button', onClick: () => openDetail('category', (content.cats || [])[0] || '其它 AI 服务', (content.cats || [])[0] || '其它 AI 服务', 'hot') }, '查看主营类目'),
          content.kind === 'category' && (content.topShops || []).map(([s, n]) => h('button', { key: s, type: 'button', onClick: () => openDetail('shop', s, s, 'categories') }, `${s} · ${n} 条`)),
          content.kind === 'item' && h('button', { type: 'button', onClick: () => { const r = (content.itemRows || [])[0]; if (r) openDetail('shop', r.store, r.store, 'offers') } }, '查看该店铺其它商品'),
          content.kind === 'item' && h('button', { type: 'button', onClick: () => { const r = (content.itemRows || [])[0]; if (r) pickCategory(r.category) } }, '查看同类目全部报价'),
        ),
      )
    }

    function groupKeyOf(url) {
      return String(url || '').replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase()
    }

    /** Tab 1: the original offer grid. */
    function OffersView({ state, filtered, pageRows, setField, onLoadMore, openDetail }) {
      return h('div', null,
        h('div', { className: 'radar-section' },
          h('h3', null, `商品报价 · ${filtered.length} 条（按不同交付类型核对后再比价）`),
          h('label', { className: 'radar-sort' }, '排序：',
            h('select', { className: 'radar-select', value: state.sort, onChange: setField('sort') },
              SORTS.map(s => h('option', { key: s.id, value: s.id }, s.label)),
            ),
          ),
        ),
        state.loading && h('div', { className: 'radar-loading' }, '正在采集多源报价…'),
        state.error && h('div', { className: 'radar-empty' }, `采集失败：${state.error}（稍后刷新重试）`),
        !state.loading && !state.error && pageRows.length === 0 && h('div', { className: 'radar-empty' }, '没有符合筛选条件的报价；放宽筛选或换个关键词试试。'),
        h('div', { className: 'radar-grid' },
          pageRows.map(r => h(OfferCard, { key: r.dedupeKey, offer: r, onOpen: () => openDetail('item', r.url || r.dedupeKey, r.title, 'offers') })),
        ),
        pageRows.length < filtered.length && h('div', { style: { marginTop: '16px', textAlign: 'center' } },
          h('button', { className: 'radar-btn', onClick: onLoadMore },
            `加载更多（还有 ${filtered.length - pageRows.length} 条）`),
        ),
      )
    }

    /** Tab 2: category board — supply, stock, price band and top shop per shelf. */
    function CategoryBoard({ rows, onPick, openDetail }) {
      const groups = React.useMemo(() => {
        const map = new Map()
        for (const r of rows) {
          const name = r.category || '其它 AI 服务'
          let g = map.get(name)
          if (!g) { g = { name, rows: [] }; map.set(name, g) }
          g.rows.push(r)
        }
        const total = rows.length || 1
        return [...map.values()].map(g => {
          const prices = g.rows.map(r => r.price).sort((a, b) => a - b)
          const shops = new Set(g.rows.map(r => r.store))
          const inStock = g.rows.filter(r => r.stock === 'in').length
          // Top shop = most offers in this category (supply leader, not sales).
          const byShop = new Map()
          for (const r of g.rows) byShop.set(r.store, (byShop.get(r.store) || 0) + 1)
          const topShop = [...byShop.entries()].sort((a, b) => b[1] - a[1])[0]
          return {
            name: g.name,
            count: g.rows.length,
            share: g.rows.length / total,
            inStock,
            lowest: prices[0],
            median: prices[Math.floor(prices.length / 2)],
            shops: shops.size,
            topShop: topShop ? topShop[0] : '—',
          }
        }).sort((a, b) => b.count - a.count)
      }, [rows])
      const maxCount = groups.reduce((m, g) => Math.max(m, g.count), 1)

      return h('div', null,
        h('div', { className: 'radar-board' },
          h('h4', { className: 'radar-board-title' }, '分类榜单 · 按 AI 品类聚合全部来源'),
          h('p', { className: 'radar-board-note' },
            '统一把七源的细分类目归入 12 个货架：报价数反映该品类的供给规模，最低/中位价是当前结果的价格带，店铺数为活跃店铺数。点「查看该类报价」切回报价卡片并自动套用类目筛选。'),
        ),
        h('div', { className: 'radar-cat-grid' },
          groups.map(g => h('div', { className: 'radar-cat radar-clickable', key: g.name,
            onClick: () => openDetail('category', g.name, g.name, 'categories') },
            h('h5', null, g.name, h('em', null, `${(g.share * 100).toFixed(1)}% 的报价`)),
            h('div', { className: 'radar-cat-metrics' },
              h('div', null, h('b', null, String(g.count)), '报价数'),
              h('div', null, h('b', null, String(g.inStock)), '标记有货'),
              h('div', null, h('b', { className: 'orange' }, `¥${formatPrice(g.lowest)}`), '最低价'),
              h('div', null, h('b', null, `¥${formatPrice(g.median)}`), '中位价'),
              h('div', null, h('b', null, String(g.shops)), '店铺数'),
            ),
            h('div', { className: 'radar-bar radar-cat-bar' },
              h('i', { style: { width: `${Math.max(3, (g.count / maxCount) * 100)}%` } }),
            ),
            h('div', { className: 'radar-cat-foot' },
              h('span', { className: 'radar-cat-shop', title: g.topShop }, `供给最多：${g.topShop}`),
              h('button', { className: 'radar-mini', type: 'button',
                onClick: (e) => { e.stopPropagation(); onPick(g.name) } }, '查看该类报价'),
            ),
          )),
        ),
      )
    }

    /** Tab 3: sales leaderboard — real published shop sales + product sold markers. */
    function HotBoard({ rows, shopSales, openDetail }) {
      const topShops = React.useMemo(() => shopSales.slice(0, 30), [shopSales])
      const maxSales = topShops.reduce((m, s) => Math.max(m, s.sales), 1)
      const offerCountByShop = React.useMemo(() => {
        const map = new Map()
        for (const r of rows) {
          const key = (r.store || '').trim().toLowerCase()
          map.set(key, (map.get(key) || 0) + 1)
        }
        return map
      }, [rows])
      const offersForShop = (name) => {
        const key = name.trim().toLowerCase()
        let count = offerCountByShop.get(key) || 0
        // Aggregator shop names often carry a platform prefix/suffix
        // (e.g. "链动小铺 · 牟利ai · 2VWX76A4"), so fall back to a contained match.
        if (count === 0 && key.length >= 3) {
          for (const [store, n] of offerCountByShop) {
            if (store.includes(key) || key.includes(store)) count += n
          }
        }
        return count
      }
      const soldProducts = React.useMemo(() => rows
        .filter(r => r.soldCount > 0)
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 20), [rows])
      const maxSold = soldProducts.reduce((m, s) => Math.max(m, s.soldCount), 1)
      // Supply leaderboard: shops by number of live offers (NOT sales).
      const supply = React.useMemo(() => {
        const map = new Map()
        for (const r of rows) {
          const key = r.store || '未知店铺'
          const cur = map.get(key) || { store: key, count: 0, platform: r.platform, inStock: 0 }
          cur.count++
          if (r.stock === 'in') cur.inStock++
          map.set(key, cur)
        }
        return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 15)
      }, [rows])
      const maxSupply = supply.reduce((m, s) => Math.max(m, s.count), 1)

      return h('div', null,
        h('div', { className: 'radar-board' },
          h('h4', { className: 'radar-board-title' }, '销售热榜 · 哪些店铺 / 商品好卖'),
          h('p', { className: 'radar-board-note' },
            '销量数字来自来源站点公开的店铺累计销量（AI价网「店铺销量」标签、云猫寄售 Shop/info 的 sell_count）与商品标题里的「已售 X」标记，是商家自行公开的历史累计口径，不是本插件的成交数据，也不代表当下实时销量；仅供选品参考，付款前请回原站核对。'),
        ),
        h('h4', { className: 'radar-subhead' }, `① 店铺累计销量榜 · ${shopSales.length} 家有公开销量数据`),
        topShops.length === 0 && h('div', { className: 'radar-empty' }, '本轮未取到公开销量数据（来源可能限流），稍后刷新。'),
        topShops.map((s, i) => h('div', { className: 'radar-rank radar-clickable', key: s.shop + i,
          onClick: () => openDetail('shop', s.shop, s.shop, 'hot') },
          h('span', { className: `radar-rank-no${i < 3 ? ' top' : ''}` }, String(i + 1)),
          h('div', { className: 'radar-rank-main' },
            h('span', { className: 'radar-rank-name', title: s.shop }, s.shop),
            h('span', { className: 'radar-rank-sub' },
              h('span', null, s.platform),
              h('span', null, `来源：${(s.sources || [s.source]).map(x => SOURCE_NAMES[x] || x).join(' + ')}`),
              h('span', null, `在售报价 ${offersForShop(s.shop)} 条`),
            ),
            h('div', { className: 'radar-bar' }, h('i', { style: { width: `${Math.max(2, (s.sales / maxSales) * 100)}%` } })),
          ),
          h('div', { className: 'radar-rank-num' },
            h('b', null, compactNumber(s.sales)),
            h('span', null, '累计销量（公开）'),
          ),
        )),
        h('h4', { className: 'radar-subhead' }, `② 商品「已售」标记榜 · ${soldProducts.length} 条`),
        soldProducts.length === 0 && h('div', { className: 'radar-empty' }, '本轮报价标题中没有「已售」标记。'),
        soldProducts.map((r, i) => h('div', { className: 'radar-rank radar-clickable', key: r.dedupeKey + i,
          onClick: () => openDetail('item', r.url || r.dedupeKey, r.title, 'hot') },
          h('span', { className: `radar-rank-no${i < 3 ? ' top' : ''}` }, String(i + 1)),
          h('div', { className: 'radar-rank-main' },
            h('span', { className: 'radar-rank-name', title: r.title }, r.title),
            h('span', { className: 'radar-rank-sub' },
              h('span', null, r.store),
              h('span', null, `¥${formatPrice(r.price)}`),
              h('span', null, SOURCE_NAMES[r.source] || r.source),
            ),
            h('div', { className: 'radar-bar' }, h('i', { style: { width: `${Math.max(2, (r.soldCount / maxSold) * 100)}%` } })),
          ),
          h('div', { className: 'radar-rank-num' },
            h('b', null, compactNumber(r.soldCount)),
            h('span', null, '标题标注已售'),
          ),
        )),
        h('h4', { className: 'radar-subhead' }, '③ 供给热度榜 · 按店铺在售报价数（非销量）'),
        h('p', { className: 'radar-board-note' }, '报价条数只反映该店被各来源收录的供给规模，不等同于销量，用于发现铺货量大的店铺。'),
        supply.map((s, i) => h('div', { className: 'radar-rank radar-clickable', key: 'supply' + i,
          onClick: () => openDetail('shop', s.store, s.store, 'hot') },
          h('span', { className: `radar-rank-no${i < 3 ? ' top' : ''}` }, String(i + 1)),
          h('div', { className: 'radar-rank-main' },
            h('span', { className: 'radar-rank-name', title: s.store }, s.store),
            h('span', { className: 'radar-rank-sub' }, h('span', null, s.platform), h('span', null, `有货 ${s.inStock} 条`)),
            h('div', { className: 'radar-bar' }, h('i', { style: { width: `${Math.max(2, (s.count / maxSupply) * 100)}%` } })),
          ),
          h('div', { className: 'radar-rank-num' },
            h('b', null, String(s.count)),
            h('span', null, '收录报价数'),
          ),
        )),
      )
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

    function OfferCard({ offer, onOpen }) {
      const stockChip = offer.stock === 'in'
        ? h('span', { className: 'radar-chip ok' }, offer.stockCount ? `标记有货 · 库存 ${offer.stockCount}` : '标记有货')
        : offer.stock === 'out'
          ? h('span', { className: 'radar-chip out' }, '缺货')
          : h('span', { className: 'radar-chip' }, '库存未知')
      return h('div', { className: 'radar-card radar-clickable', onClick: onOpen },
        h('div', { className: 'radar-chips' },
          h('span', { className: 'radar-chip' }, offer.platform),
          h('span', { className: 'radar-chip src' }, `来源：${SOURCE_NAMES[offer.source] || offer.source}`),
          h('span', { className: 'radar-chip' }, offer.productType),
          stockChip,
          offer.groupCount > 1 && h('span', { className: 'radar-chip src' }, `${offer.groupCount} 源同款`),
        ),
        h('div', { className: 'radar-card-title', title: offer.title }, offer.title),
        h('div', { className: 'radar-price' }, h('small', null, offer.currency), formatPrice(offer.price)),
        h('div', { className: 'radar-store' }, offer.store.startsWith(offer.platform) ? offer.store : `${offer.platform} · ${offer.store}`),
        h('div', { className: 'radar-card-foot' },
          h('span', { className: 'radar-obs' }, offer.observedAt ? `观察：${relTime(offer.observedAt)}` : ''),
          offer.url
            ? h('a', { className: 'radar-link', href: offer.url, target: '_blank', rel: 'noopener noreferrer nofollow',
              onClick: (e) => e.stopPropagation() }, '查看原始报价')
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

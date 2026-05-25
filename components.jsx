// components.jsx — presentational pieces for the WPX terminal

const { useState, useEffect, useRef, useMemo } = React;

// ── helpers ────────────────────────────────────────────────────
const fmt       = (n) => n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US');
const fmtNoSign = (n) => n == null ? '—' : Math.round(n).toLocaleString('en-US');
const pct       = (n) => (n > 0 ? '+' : '') + n.toFixed(2) + '%';
const usdDelta  = (n) => (n > 0 ? '+' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
const clockStr  = (d = new Date()) => d.toTimeString().slice(0, 8);

// ── TopBar ─────────────────────────────────────────────────────
function TopBar({ user, clock }) {
  return (
    <div className="topbar">
      <div className="brand"><span className="dot" />WPX TERMINAL</div>
      <div className="menu">
        <span>FILE</span><span>VIEW</span><span>WATCHLIST</span>
        <span>ALERTS</span><span>SOURCES</span><span>HELP</span>
      </div>
      <div className="spacer" />
      <div className="info">
        <span><b>USR</b> {user}</span>
        <span><b>SES</b> #4187-A</span>
        <span><b>UTC</b> {clock}</span>
      </div>
      <div className="info live"><span className="pulse" /> LIVE FEED</div>
    </div>
  );
}

// ── Ticker tape ────────────────────────────────────────────────
function Ticker({ catalog }) {
  const items = useMemo(() => {
    const arr = catalog.map((w) => {
      const delta = (w.avg - w.lastAvg) / w.lastAvg * 100;
      return { ref: w.ref.split('.')[0].slice(0, 8) || w.ref, px: w.avg, d: delta, nick: w.nick };
    });
    return [...arr, ...arr, ...arr];
  }, [catalog]);
  return (
    <div className="ticker">
      <div className="label">LIVE TAPE</div>
      <div className="track">
        {items.map((it, i) => (
          <div className="tick" key={i}>
            <span className="ref">{it.nick.toUpperCase()}</span>
            <span className="px">{fmt(it.px)}</span>
            <span className={'d ' + (it.d >= 0 ? 'up' : 'dn')}>
              {it.d >= 0 ? '▲' : '▼'} {pct(it.d)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar / watchlist ────────────────────────────────────────
function Sidebar({ catalog, activeId, onPick, query, setQuery }) {
  const filtered = useMemo(() => {
    if (!query.trim()) return catalog;
    const q = query.toLowerCase();
    return catalog.filter((w) =>
      (w.brand + ' ' + w.model + ' ' + w.ref + ' ' + w.nick).toLowerCase().includes(q)
    );
  }, [catalog, query]);

  return (
    <div className="col sidebar">
      <div className="panel-h">
        <span className="seq">F1</span><span>WATCHLIST</span>
        <div className="h-tabs">
          <div className="h-tab on">MINE</div>
          <div className="h-tab">MARKET</div>
        </div>
      </div>
      <div className="search-row">
        <span className="prompt">›</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH BRAND / REF / KEYWORD"
        />
        <span className="caret" />
      </div>
      <div className="watchlist">
        <div className="wl-section">
          <span>★ TRACKED</span><span className="ct">{filtered.length} / {catalog.length}</span>
        </div>
        {filtered.map((w) => {
          const delta = (w.avg - w.lastAvg) / w.lastAvg * 100;
          const dir   = delta > 0.05 ? 'up' : delta < -0.05 ? 'dn' : 'flat';
          return (
            <div
              key={w.id}
              className={'wl-item' + (w.id === activeId ? ' on' : '')}
              onClick={() => onPick(w.id)}
            >
              <div className="thumb">
                <image-slot
                  id={'wpx-thumb-' + w.id}
                  shape="rect"
                  fit="cover"
                  placeholder=""
                  src={w.photo || ''}
                  style={{ width: '38px', height: '38px', display: 'block' }}
                />
              </div>
              <div className="nm">
                {w.brand.toUpperCase()} <em>{w.nick}</em>
                {w.alerts > 0 && <span className="alert-dot">●{w.alerts}</span>}
              </div>
              <div className="px">{fmt(w.avg)}</div>
              <div className="ref">{w.ref}</div>
              <div className={'d ' + dir}>
                {dir === 'up' ? '▲' : dir === 'dn' ? '▼' : '▬'} {pct(delta)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Spec / ID bar above hero ───────────────────────────────────
function SpecBar({ watch, summary }) {
  const premium     = watch.msrp > 0 ? (summary.avg - watch.msrp) / watch.msrp * 100 : 0;
  const premiumTone = premium < -3 ? 'green' : premium > 5 ? 'red' : 'amber';
  return (
    <div className="specbar">
      <div className="watch-viz" style={{ color: 'var(--amber)' }}>
        <WatchSVG id={watch.image} size={56} accent />
      </div>
      <div className="id">
        <div className="row1">
          <span className="brand">{watch.brand}</span>
          <span className="ref">REF · {watch.ref}</span>
        </div>
        <div className="model">{watch.model}</div>
      </div>
      <div className="stat">
        <div className="k">Case</div>
        <div className="v">{watch.case}</div>
      </div>
      <div className="stat">
        <div className="k">Movement</div>
        <div className="v" style={{ fontSize: 12, lineHeight: 1.3 }}>{watch.movement}</div>
      </div>
      <div className="stat">
        <div className="k">MSRP</div>
        <div className="v">{fmt(watch.msrp)}</div>
      </div>
      <div className="stat">
        <div className="k">vs MSRP</div>
        <div className={'v ' + premiumTone}>{pct(premium)}</div>
      </div>
      <div className="stat" style={{ borderRight: 0 }}>
        <div className="k">Sources</div>
        <div className="v amber">{summary.n} / 7</div>
      </div>
    </div>
  );
}

// ── Hero AVG number + verdict + distribution ───────────────────
function HeroPanel({ watch, summary, verdict: v, loading }) {
  const wow    = summary.avg - (watch.lastAvg || summary.avg);
  const wowPct = watch.lastAvg ? wow / watch.lastAvg * 100 : 0;
  const wowDir = wow >= 0 ? 'up' : 'dn';

  const rangeLo = Math.min(summary.lo, watch.msrp) * 0.97;
  const rangeHi = Math.max(summary.hi, watch.msrp) * 1.03;
  const placePct = (val) => (val - rangeLo) / (rangeHi - rangeLo) * 100;

  return (
    <div className="hero">
      <div className="hero-num">
        <div className="lbl">
          <span>AVERAGE STREET PRICE · 7 SRC</span>
          <span className="badge-now">NOW</span>
        </div>
        <div className="avg-row">
          <div className="hero-watch">
            <image-slot
              key={watch.id}
              id={'wpx-hero-' + watch.id}
              shape="rect"
              fit="cover"
              placeholder={'Drop a ' + watch.brand + ' photo'}
              src={watch.photo || ''}
              style={{ width: '128px', display: 'block', height: '256px' }}
            />
          </div>
          <div>
            <div className="avg">
              <span className="pre">$</span>
              <span className={loading ? 'shimmer' : ''}>
                {loading ? '888,888' : fmtNoSign(summary.avg)}
              </span>
              <span className="cents">.00</span>
            </div>
            <div className={'delta ' + wowDir}>
              <span className="arrow">{wowDir === 'up' ? '▲' : '▼'}</span>
              <span>{usdDelta(wow)}</span>
              <span>{pct(wowPct)}</span>
              <span className="small">vs prev. session</span>
            </div>
          </div>
        </div>
        <div className="verdict">
          <div className="vlbl">DESK VERDICT</div>
          <div className={'vval ' + v.tone}>◆ {v.code}</div>
          <div className="vnote">{v.note}</div>
        </div>
      </div>

      <div className="hero-range">
        <div className="range-stats">
          <div className="cell">
            <div className="k">Low quote</div>
            <div className="v" style={{ color: 'var(--green)' }}>{fmt(summary.lo)}</div>
            <div className="sub">{summary.spread ? `Δ ${fmt(summary.spread)} spread` : '—'}</div>
          </div>
          <div className="cell">
            <div className="k">High quote</div>
            <div className="v" style={{ color: 'var(--red)' }}>{fmt(summary.hi)}</div>
            <div className="sub">{summary.hi && summary.lo ? pct((summary.hi - summary.lo) / summary.lo * 100) + ' span' : ''}</div>
          </div>
          <div className="cell">
            <div className="k">Median</div>
            <div className="v">{fmt(summary.median)}</div>
            <div className="sub">σ {fmt(summary.stdev)}</div>
          </div>
          <div className="cell">
            <div className="k">vs MSRP</div>
            <div className="v" style={{ color: summary.msrpDelta < 0 ? 'var(--green)' : 'var(--red)' }}>
              {summary.msrpDelta < 0 ? '−' : '+'}{fmt(Math.abs(summary.msrpDelta))}
            </div>
            <div className="sub">MSRP {fmt(watch.msrp)}</div>
          </div>
        </div>

        <div style={{ marginTop: 22, color: 'var(--dim)', fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          PRICE DISTRIBUTION · LOW · AVG · HIGH
        </div>
        <div className="distrib">
          <div className="axis" />
          <div className="pin avg" style={{ left: placePct(watch.msrp) + '%', background: 'var(--dim)' }} title="MSRP" />
          <div className="pin you" style={{ left: placePct(summary.avg) + '%' }} title="Avg" />
          <div className="lbl-c" style={{ left: placePct(summary.avg) + '%' }}>AVG {fmt(summary.avg)}</div>
          <div className="lbl-l">{fmt(summary.lo)}</div>
          <div className="lbl-r">{fmt(summary.hi)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Retailer table ────────────────────────────────────────────
function RetailerTable({ retailers, quotes, summary, watch, includedIds, toggle, loading }) {
  const validQuotes = quotes.filter((q) => q.px != null);
  const minPx = validQuotes.length ? Math.min(...validQuotes.map((q) => q.px)) : 0;
  const maxPx = validQuotes.length ? Math.max(...validQuotes.map((q) => q.px)) : 0;

  return (
    <div className="col retailers-col">
      <div className="panel-h">
        <span className="seq">F2</span><span>Sources · Live Quotes</span>
        <div className="h-tabs">
          <div className="h-tab on">7</div>
          <div className="h-tab">{summary.n}</div>
        </div>
      </div>
      <div className="r-thead">
        <span className="num">#</span>
        <span>RETAILER</span>
        <span style={{ textAlign: 'right' }}>PRICE</span>
        <span style={{ textAlign: 'right' }}>Δ AVG</span>
        <span>VS RANGE</span>
      </div>
      <div className="r-rows">
        {quotes.map((q, i) => {
          const r        = retailers.find((r) => r.id === q.id);
          const included = includedIds.has(q.id);
          const dAvg     = q.px != null ? q.px - summary.avg : null;
          const dPct     = q.px != null && summary.avg ? dAvg / summary.avg * 100 : null;
          const isBest   = q.px === minPx && q.px != null;
          const isWorst  = q.px === maxPx && q.px != null;

          let barPct = 50, barClass = '';
          if (q.px != null && maxPx !== minPx) {
            barPct   = (q.px - minPx) / (maxPx - minPx) * 100;
            barClass = q.px < summary.avg ? 'under' : q.px > summary.avg ? 'over' : '';
          }

          return (
            <div
              key={q.id}
              className={'r-row' + (!included ? ' muted' : '') + (r.kind === 'OEM' ? ' oem' : '')}
            >
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <div className="nm">
                <span className="n">
                  {r.kind === 'OEM'
                    ? window.WPX_DATA.BRAND_SITES[watch.brand] || watch.brand + '.com'
                    : r.name}
                  {isBest && <span style={{ color: 'var(--green)', marginLeft: 6, fontSize: 9, fontFamily: 'var(--sans)', fontWeight: 700, letterSpacing: '0.1em' }}>BEST</span>}
                  {isWorst && validQuotes.length > 1 && <span style={{ color: 'var(--red)', marginLeft: 6, fontSize: 9, fontFamily: 'var(--sans)', fontWeight: 700, letterSpacing: '0.1em' }}>HIGH</span>}
                </span>
                <span className="meta">
                  <span>{r.tag}</span>
                  <span>·</span>
                  <span>{q.cond}</span>
                  <span>·</span>
                  <span className={'stock ' + q.stock}>
                    {q.stock === 'in'       ? '● IN STOCK' :
                     q.stock === 'low'      ? '◐ LOW'      :
                     q.stock === 'preorder' ? '◔ PRE-ORD'  : '○ OUT'}
                  </span>
                </span>
              </div>
              <span className="px">
                <span className={loading ? 'shimmer' : ''}>
                  {q.px == null ? <span style={{ color: 'var(--dim)' }}>—</span> : fmt(q.px)}
                </span>
                <span className="age" title={q.age === 0 ? 'Just refreshed' : q.age + ' days ago'}>
                  {q.age === 0 ? '· now' : '· ' + q.age + 'd'}
                </span>
              </span>
              <span className={'d ' + (dAvg == null ? 'flat' : dAvg < 0 ? 'up' : dAvg > 0 ? 'dn' : 'flat')}>
                {dAvg == null ? '—' : (dAvg > 0 ? '+' : '') + pct(dPct)}
              </span>
              <div className="bar">
                <div
                  className={'fill ' + barClass}
                  style={{ width: q.px == null ? '0%' : Math.max(4, barPct) + '%' }}
                />
              </div>
              <div className="toggle" onClick={() => toggle(q.id)} title="Toggle in average">
                {included ? '✓' : '·'}
              </div>
            </div>
          );
        })}
      </div>
      <div className="r-foot">
        <div className="line">
          <span className="k">Mean of {summary.n} active</span>
          <span className="v">{fmt(summary.avg)}</span>
        </div>
        <div className="line">
          <span className="k">vs MSRP</span>
          <span className={'v ' + (summary.msrpDelta < 0 ? 'green' : '')}>
            {summary.msrpDelta < 0 ? '−' : '+'}{fmt(Math.abs(summary.msrpDelta))} ({pct(summary.msrpDelta / watch.msrp * 100)})
          </span>
        </div>
        <div className="line">
          <span className="k">σ Std. dev</span>
          <span className="v">{fmt(summary.stdev)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Price history chart ────────────────────────────────────────
function HistoryChart({ history, summary, watch, range, onRange, marketNote }) {
  const ref  = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 240 });

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      const r = ref.current.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const slice = useMemo(() => {
    const days = { '7D': 7, '30D': 30, '90D': 90 }[range] || 30;
    return history.slice(-days - 1);
  }, [history, range]);

  if (size.w < 100) return <div className="chart" ref={ref} />;

  const padL = 48, padR = 16, padT = 12, padB = 22;
  const w = size.w - padL - padR;
  const h = size.h - padT - padB;

  const all = slice.flatMap((d) => [d.lo, d.hi, d.avg, d.msrp]);
  let yMin = Math.min(...all);
  let yMax = Math.max(...all);
  const pad = (yMax - yMin) * 0.1;
  yMin -= pad; yMax += pad;

  const x = (i) => padL + i / (slice.length - 1) * w;
  const y = (v) => padT + h - (v - yMin) / (yMax - yMin) * h;

  const path = (key) => slice.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');
  const area = `${path('avg')} L ${x(slice.length - 1).toFixed(1)} ${(padT + h).toFixed(1)} L ${padL.toFixed(1)} ${(padT + h).toFixed(1)} Z`;

  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (yMax - yMin) / 4 * i;
    yTicks.push({ v, yPos: y(v) });
  }

  const xTickIdx = [0, Math.round(slice.length * 0.25), Math.round(slice.length * 0.5), Math.round(slice.length * 0.75), slice.length - 1];

  const last      = slice[slice.length - 1] || {};
  const first     = slice[0] || {};
  const periodPct = first.avg ? (last.avg - first.avg) / first.avg * 100 : 0;

  return (
    <div className="chart-wrap">
      <div className="chart-head">
        <span className="ttl">Price History · {watch.brand} {watch.nick}</span>
        <div className="now">
          <div className="pair"><span className="k">Avg</span><span className="v">{fmt(last.avg)}</span></div>
          <div className="pair">
            <span className="k">Period Δ</span>
            <span className={'v ' + (periodPct >= 0 ? 'green' : 'red')}>{pct(periodPct)}</span>
          </div>
          <div className="pair"><span className="k">Note</span><span className="v amber">{marketNote || '—'}</span></div>
        </div>
        <div className="range-pills">
          {['7D', '30D', '90D'].map((r) => (
            <div
              key={r}
              className={'pill' + (r === range ? ' on' : '')}
              onClick={() => onRange(r)}
            >{r}</div>
          ))}
        </div>
      </div>
      <div className="chart" ref={ref}>
        <svg viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
          {yTicks.map((t, i) => (
            <g key={'gy' + i}>
              <line className={'gridline' + (i === 0 || i === 4 ? ' maj' : '')}
                x1={padL} y1={t.yPos} x2={size.w - padR} y2={t.yPos} />
              <text className="axis-l" x={padL - 6} y={t.yPos + 3} textAnchor="end">
                ${(Math.round(t.v / 100) * 100).toLocaleString('en-US')}
              </text>
            </g>
          ))}
          {xTickIdx.map((idx, i) => {
            const d = slice[idx];
            if (!d) return null;
            const dayLabel = d.d === 0 ? 'NOW' : `−${d.d}D`;
            return (
              <g key={'gx' + i}>
                <line className="gridline" x1={x(idx)} y1={padT} x2={x(idx)} y2={padT + h} />
                <text className="axis-b" x={x(idx)} y={size.h - 6} textAnchor="middle">{dayLabel}</text>
              </g>
            );
          })}
          <path className="area-avg" d={area} />
          <path className="line-msrp" d={path('msrp')} />
          <path className="line-hi"   d={path('hi')} />
          <path className="line-lo"   d={path('lo')} />
          <path className="line-avg"  d={path('avg')} />
          <circle cx={x(slice.length - 1)} cy={y(last.avg || 0)} r="3" fill="var(--amber)" />
          <circle cx={x(slice.length - 1)} cy={y(last.avg || 0)} r="6" fill="var(--amber)" opacity="0.25" />
        </svg>
        <div className="legend">
          <span><span className="sw" style={{ background: 'var(--amber)' }} /> AVG</span>
          <span><span className="sw" style={{ background: 'var(--green)' }} /> LOW</span>
          <span><span className="sw" style={{ background: 'var(--red)'   }} /> HIGH</span>
          <span><span className="sw" style={{ background: 'var(--dim)'   }} /> MSRP</span>
        </div>
      </div>
    </div>
  );
}

// ── Alerts panel ──────────────────────────────────────────────
function AlertsPanel({ alerts }) {
  return (
    <div className="alerts">
      <div className="panel-h">
        <span className="seq">F3</span><span>Alerts Feed · Live</span>
        <div className="h-tabs">
          <div className="h-tab on">ALL</div>
          <div className="h-tab">PX</div>
          <div className="h-tab">STK</div>
        </div>
      </div>
      <div className="alert-list">
        {alerts.map((a) => (
          <div key={a.id} className={'alert' + (a.sev === 'high' ? ' severe' : '')}>
            <span className="t">{a.t}</span>
            <span className="b" dangerouslySetInnerHTML={{ __html: a.html }} />
            <span className="tag">{a.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Status bar ────────────────────────────────────────────────
function StatusBar({ loading, lastUpdate, clock, sourcesOk }) {
  return (
    <div className="status">
      <div>
        <span className={loading ? 'amber' : 'green'}>●</span>
        <span className="k">FEED</span>
        <span className="v">{loading ? 'SYNCING…' : 'NOMINAL'}</span>
      </div>
      <div>
        <span className="k">SRC</span>
        <span className="v green">{sourcesOk}/7</span>
      </div>
      <div>
        <span className="k">LAST</span>
        <span className="v">{lastUpdate}</span>
      </div>
      <div>
        <span className="k">CLK</span>
        <span className="v">{clock}</span>
      </div>
      <div className="spacer" />
      <div className="keys">
        <span className="key"><b>R</b> REFRESH</span>
        <span className="key"><b>A</b> SET ALERT</span>
        <span className="key"><b>/</b> SEARCH</span>
        <span className="key"><b>1-6</b> JUMP</span>
        <span className="key"><b>T</b> THEME</span>
      </div>
      <div>
        <span className="k">BUILD</span>
        <span className="v">v1.0.0</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  TopBar, Ticker, Sidebar, SpecBar, HeroPanel, RetailerTable,
  HistoryChart, AlertsPanel, StatusBar,
  fmt, fmtNoSign, pct, clockStr,
});

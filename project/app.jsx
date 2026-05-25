// app.jsx — WPX Watch Price Terminal main app

const { useState, useEffect, useMemo, useCallback, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "classic",
  "showMSRPLine": true,
  "autoRefreshSec": 0,
  "compactRows": false
}/*EDITMODE-END*/;

function App() {
  const { RETAILERS, CATALOG, SEED_QUOTES, SEED_ALERTS,
          genHistory, summarize, verdict, fetchLiveQuotes } = window.WPX_DATA;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Active watch
  const [activeId, setActiveId] = useState('omega-speedy-pro');
  const watch = useMemo(() => CATALOG.find(w => w.id === activeId), [activeId, CATALOG]);

  // Per-watch quotes (mutable, can be refreshed)
  const [quotesByWatch, setQuotesByWatch] = useState(() => {
    const m = {};
    for (const id in SEED_QUOTES) m[id] = SEED_QUOTES[id];
    return m;
  });

  // Included retailer ids in the average (toggle)
  const [includedIds, setIncludedIds] = useState(() => new Set(RETAILERS.map(r => r.id)));
  const toggleRetailer = useCallback((id) => {
    setIncludedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      // require at least 2
      if (n.size < 2) return prev;
      return n;
    });
  }, []);

  // History per watch — memo'd
  const histByWatch = useMemo(() => {
    const m = {};
    for (const w of CATALOG) m[w.id] = genHistory(w);
    return m;
  }, [CATALOG]);

  const quotes = quotesByWatch[activeId] || [];
  const activeQuotes = quotes.filter(q => includedIds.has(q.id));
  const summary = useMemo(() => summarize(activeQuotes, watch.msrp), [activeQuotes, watch.msrp]);
  const v = useMemo(() => verdict(summary, watch.msrp), [summary, watch.msrp]);
  const history = histByWatch[activeId] || [];

  // Search & range
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('30D');

  // Alerts + market note
  const [alerts, setAlerts] = useState(SEED_ALERTS);
  const nextAlertId = useRef(1000);
  const addAlert = useCallback((html, tag = 'PX', sev = 'low') => {
    setAlerts(prev => [{
      id: nextAlertId.current++,
      t: clockStr(),
      tag, sev, html,
    }, ...prev].slice(0, 30));
  }, []);

  // Clock
  const [clock, setClock] = useState(clockStr());
  useEffect(() => {
    const id = setInterval(() => setClock(clockStr()), 1000);
    return () => clearInterval(id);
  }, []);

  // Live update via window.claude.complete
  const [loading, setLoading] = useState(false);
  const [marketNote, setMarketNote] = useState('Mkt opening · feeds syncing.');
  const [lastUpdate, setLastUpdate] = useState('—');

  const refresh = useCallback(async (silent = false) => {
    if (loading) return;
    setLoading(true);
    if (!silent) addAlert(`<b>${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()}</b> manual refresh initiated.`, 'SYS', 'low');
    const cur = quotesByWatch[watch.id];
    const res = await fetchLiveQuotes(watch, cur);
    setLoading(false);
    if (res) {
      const oldAvg = summarize(cur.filter(q => includedIds.has(q.id)), watch.msrp).avg;
      setQuotesByWatch(prev => ({ ...prev, [watch.id]: res.quotes }));
      const newAvg = summarize(res.quotes.filter(q => includedIds.has(q.id)), watch.msrp).avg;
      const delta = newAvg - oldAvg;
      const pct = (delta / oldAvg) * 100;
      if (Math.abs(pct) > 0.05) {
        addAlert(
          `<b>${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()}</b> avg ` +
          `<span class="${delta >= 0 ? 'up' : 'dn'}">${delta >= 0 ? '+' : '−'}$${Math.abs(Math.round(delta)).toLocaleString('en-US')}</span> ` +
          `to <b>$${newAvg.toLocaleString('en-US')}</b>.`,
          'PX', Math.abs(pct) > 0.5 ? 'high' : 'mid'
        );
      }
      if (res.note) setMarketNote(res.note.slice(0, 60));
      setLastUpdate(clockStr());
    } else {
      addAlert(`<b>FEED</b> live source unavailable, retaining last quote.`, 'SYS', 'mid');
    }
  }, [loading, watch, quotesByWatch, includedIds, addAlert]);

  // First-load refresh
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    refresh(true);
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!t.autoRefreshSec) return;
    const id = setInterval(() => refresh(true), Math.max(15, t.autoRefreshSec) * 1000);
    return () => clearInterval(id);
  }, [t.autoRefreshSec, refresh]);

  // Theme application — toggle a body class
  useEffect(() => {
    document.body.classList.toggle('theme-editorial', t.theme === 'editorial');
    document.body.classList.toggle('theme-classic',   t.theme !== 'editorial');
  }, [t.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'r') { e.preventDefault(); refresh(); }
      else if (k === 't') { setTweak('theme', t.theme === 'editorial' ? 'classic' : 'editorial'); }
      else if (k === '/') { e.preventDefault(); document.querySelector('.search-row input')?.focus(); }
      else if (k === 'a') {
        addAlert(`<b>${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()}</b> alert set at <b>$${summary.avg.toLocaleString('en-US')}</b>.`, 'ALR', 'mid');
      }
      else if (/^[1-9]$/.test(k)) {
        const idx = parseInt(k, 10) - 1;
        if (CATALOG[idx]) setActiveId(CATALOG[idx].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [t.theme, refresh, addAlert, watch, summary, setTweak, CATALOG]);

  const sourcesOk = quotes.filter(q => q.px != null).length;

  return (
    <div className="app">
      <TopBar user="kira@castle-watch.co" clock={clock} />
      <Ticker catalog={CATALOG} />

      <div className="main">
        <Sidebar
          catalog={CATALOG}
          activeId={activeId}
          onPick={setActiveId}
          query={query}
          setQuery={setQuery}
        />

        <div className="col col-mid">
          <SpecBar watch={watch} summary={summary} />
          <HeroPanel watch={watch} summary={summary} verdict={v} loading={loading} />
          <HistoryChart
            history={history}
            summary={summary}
            watch={watch}
            range={range}
            onRange={setRange}
            marketNote={marketNote}
          />
        </div>

        <div className="col" style={{ display: 'grid', gridTemplateRows: '1fr auto', minHeight: 0 }}>
          <RetailerTable
            retailers={RETAILERS}
            quotes={quotes}
            summary={summary}
            watch={watch}
            includedIds={includedIds}
            toggle={toggleRetailer}
            loading={loading}
          />
          <AlertsPanel alerts={alerts.slice(0, 8)} />
        </div>
      </div>

      <StatusBar loading={loading} lastUpdate={lastUpdate} clock={clock} sourcesOk={sourcesOk} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Visual direction" />
        <TweakRadio
          label="Theme"
          value={t.theme}
          options={[
            { value: 'classic', label: 'Classic' },
            { value: 'editorial', label: 'Editorial' },
          ]}
          onChange={(v) => setTweak('theme', v)}
        />
        <TweakSection label="Behavior" />
        <TweakSlider
          label="Auto-refresh"
          value={t.autoRefreshSec}
          min={0} max={120} step={15}
          unit="s"
          onChange={(v) => setTweak('autoRefreshSec', v)}
        />
        <TweakButton
          label={loading ? 'Refreshing…' : 'Refresh quotes now'}
          onClick={() => refresh()}
        />
        <TweakButton
          label="Set price alert at current avg"
          onClick={() => {
            addAlert(`<b>${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()}</b> alert set at <b>$${summary.avg.toLocaleString('en-US')}</b>.`, 'ALR', 'mid');
          }}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

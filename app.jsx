// app.jsx — WPX Watch Price Terminal

const { useState, useEffect, useMemo, useCallback, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "classic",
  "autoRefreshSec": 0
}/*EDITMODE-END*/;

// ── Price alert threshold helpers ──────────────────────────────
const LS_THRESHOLDS = 'wpx-thresholds';

function loadThresholds() {
  try { return JSON.parse(localStorage.getItem(LS_THRESHOLDS)) || {}; } catch { return {}; }
}

function saveThresholds(t) {
  try { localStorage.setItem(LS_THRESHOLDS, JSON.stringify(t)); } catch {}
}

function thresholdCrossed(threshold, avg) {
  if (!threshold || !avg) return false;
  return threshold.dir === 'below' ? avg <= threshold.price : avg >= threshold.price;
}

// ── App ────────────────────────────────────────────────────────
function App() {
  const {
    RETAILERS, CATALOG, SEED_QUOTES, SEED_ALERTS,
    genHistory, summarize, verdict, fetchLiveQuotes,
  } = window.WPX_DATA;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [activeId, setActiveId] = useState('omega-speedy-pro');
  const watch = useMemo(() => CATALOG.find(w => w.id === activeId), [activeId]);

  const [quotesByWatch, setQuotesByWatch] = useState(() => {
    const m = {};
    for (const id in SEED_QUOTES) m[id] = SEED_QUOTES[id];
    return m;
  });

  const [includedIds, setIncludedIds] = useState(() => new Set(RETAILERS.map(r => r.id)));
  const toggleRetailer = useCallback((id) => {
    setIncludedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      if (n.size < 2) return prev;
      return n;
    });
  }, []);

  const histByWatch = useMemo(() => {
    const m = {};
    for (const w of CATALOG) m[w.id] = genHistory(w);
    return m;
  }, []);

  const [prevAvgByWatch, setPrevAvgByWatch] = useState({});
  const [histPatchByWatch, setHistPatchByWatch] = useState({});

  const quotes       = quotesByWatch[activeId] || [];
  const activeQuotes = quotes.filter(q => includedIds.has(q.id));
  const summary      = useMemo(() => summarize(activeQuotes, watch.msrp), [activeQuotes, watch.msrp]);
  const v            = useMemo(() => verdict(summary, watch.msrp), [summary, watch.msrp]);

  const liveAvgByWatch = useMemo(() => {
    const m = {};
    for (const w of CATALOG) {
      const wq = quotesByWatch[w.id] || [];
      const s  = summarize(wq.filter(q => includedIds.has(q.id)), w.msrp);
      m[w.id]  = s.avg || w.avg;
    }
    return m;
  }, [quotesByWatch, includedIds]);

  const history = useMemo(() => {
    const base  = histByWatch[activeId] || [];
    const patch = histPatchByWatch[activeId];
    if (!patch) return base;
    return [...base.slice(0, -1), { ...base[base.length - 1], ...patch }];
  }, [histByWatch, histPatchByWatch, activeId]);

  const [query, setQuery] = useState('');
  const [range, setRange] = useState('30D');

  const [alerts, setAlerts]   = useState(SEED_ALERTS);
  const nextAlertId            = useRef(1000);
  const addAlert = useCallback((html, tag = 'PX', sev = 'low') => {
    setAlerts(prev => [{
      id: nextAlertId.current++,
      t: clockStr(),
      tag, sev, html,
    }, ...prev].slice(0, 30));
  }, []);

  // ── Price alert thresholds ─────────────────────────────────────
  // { [watchId]: { price: number, dir: 'above'|'below' } }
  const [thresholds, setThresholds] = useState(loadThresholds);

  useEffect(() => { saveThresholds(thresholds); }, [thresholds]);

  const setThreshold = useCallback((watchId, price, dir) => {
    setThresholds(prev => ({ ...prev, [watchId]: { price, dir } }));
  }, []);

  const clearThreshold = useCallback((watchId) => {
    setThresholds(prev => { const n = { ...prev }; delete n[watchId]; return n; });
  }, []);

  // ── Clock ──────────────────────────────────────────────────────
  const [clock, setClock] = useState(clockStr());
  useEffect(() => {
    const id = setInterval(() => setClock(clockStr()), 1000);
    return () => clearInterval(id);
  }, []);

  const [loading, setLoading]       = useState(false);
  const [marketNote, setMarketNote] = useState('Mkt opening · feeds syncing.');
  const [lastUpdate, setLastUpdate] = useState('—');

  // ── Refresh ────────────────────────────────────────────────────
  const refresh = useCallback(async (silent = false) => {
    if (loading) return;
    setLoading(true);
    if (!silent) addAlert(`<b>${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()}</b> manual refresh initiated.`, 'SYS', 'low');
    const cur    = quotesByWatch[watch.id];
    const oldAvg = summarize(cur.filter(q => includedIds.has(q.id)), watch.msrp).avg;
    const res    = await fetchLiveQuotes(watch, cur);
    setLoading(false);
    if (res) {
      setPrevAvgByWatch(prev => ({ ...prev, [watch.id]: oldAvg }));
      setQuotesByWatch(prev => ({ ...prev, [watch.id]: res.quotes }));
      const newAvg = summarize(res.quotes.filter(q => includedIds.has(q.id)), watch.msrp).avg;
      setHistPatchByWatch(prev => ({
        ...prev,
        [watch.id]: { avg: newAvg, lo: Math.round(newAvg * 0.94), hi: Math.round(newAvg * 1.06) },
      }));

      // Check threshold for the active watch.
      const thr = thresholds[watch.id];
      if (thr && thresholdCrossed(thr, newAvg)) {
        const crossed = thr.dir === 'below'
          ? `dropped to or below <b>${fmt(thr.price)}</b>`
          : `risen to or above <b>${fmt(thr.price)}</b>`;
        addAlert(
          `<b>ALERT</b> ${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()} avg has ${crossed} — now <b>${fmt(newAvg)}</b>.`,
          'ALR', 'high'
        );
        // Clear the threshold so it doesn't re-fire on the next refresh.
        clearThreshold(watch.id);
      }

      const delta  = newAvg - oldAvg;
      const pctVal = (delta / oldAvg) * 100;
      if (Math.abs(pctVal) > 0.05) {
        addAlert(
          `<b>${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()}</b> avg ` +
          `<span class="${delta >= 0 ? 'up' : 'dn'}">${delta >= 0 ? '+' : '−'}$${Math.abs(Math.round(delta)).toLocaleString('en-US')}</span> ` +
          `to <b>${fmt(newAvg)}</b>.`,
          'PX', Math.abs(pctVal) > 0.5 ? 'high' : 'mid'
        );
      }
      if (res.note) setMarketNote(res.note.slice(0, 60));
      setLastUpdate(clockStr());
    } else {
      addAlert(`<b>FEED</b> live source unavailable, retaining last quote.`, 'SYS', 'mid');
    }
  }, [loading, watch, quotesByWatch, includedIds, addAlert, thresholds, clearThreshold]);

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    refresh(true);
  }, [refresh]);

  useEffect(() => {
    if (!t.autoRefreshSec) return;
    const id = setInterval(() => refresh(true), Math.max(15, t.autoRefreshSec) * 1000);
    return () => clearInterval(id);
  }, [t.autoRefreshSec, refresh]);

  useEffect(() => {
    document.body.classList.toggle('theme-editorial', t.theme === 'editorial');
    document.body.classList.toggle('theme-classic',   t.theme !== 'editorial');
  }, [t.theme]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'r') { e.preventDefault(); refresh(); }
      else if (k === 't') { setTweak('theme', t.theme === 'editorial' ? 'classic' : 'editorial'); }
      else if (k === 'e') {
        window.dispatchEvent(new MessageEvent('message', { data: { type: '__activate_edit_mode' } }));
      }
      else if (k === '/') { e.preventDefault(); document.querySelector('.search-row input')?.focus(); }
      else if (k === 'a') {
        // Set a "below current avg" threshold as a quick buy-signal alert.
        const price = summary.avg;
        if (thresholds[watch.id]) {
          clearThreshold(watch.id);
          addAlert(`<b>ALERT CLEARED</b> ${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()} threshold removed.`, 'ALR', 'low');
        } else {
          setThreshold(watch.id, price, 'below');
          addAlert(
            `<b>ALERT SET</b> ${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()} — notify if avg falls to <b>${fmt(price)}</b> or below.`,
            'ALR', 'mid'
          );
        }
      }
      else if (/^[1-9]$/.test(k)) {
        const idx = parseInt(k, 10) - 1;
        if (CATALOG[idx]) setActiveId(CATALOG[idx].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [t.theme, refresh, addAlert, watch, summary, setTweak, thresholds, setThreshold, clearThreshold]);

  const sourcesOk = quotes.filter(q => q.px != null).length;

  // ── Tweaks panel threshold state ───────────────────────────────
  const activeThr    = thresholds[activeId];
  const [thrPrice, setThrPrice] = useState(() => summary.avg);
  const [thrDir,   setThrDir]   = useState('below');

  // Keep thrPrice in sync when switching watches or when summary first loads.
  useEffect(() => {
    setThrPrice(activeThr ? activeThr.price : summary.avg);
    setThrDir(activeThr ? activeThr.dir : 'below');
  }, [activeId, activeThr?.price, activeThr?.dir]);

  return (
    <div className="app">
      <TopBar user="kira@castle-watch.co" clock={clock} />
      <Ticker catalog={CATALOG} liveAvgByWatch={liveAvgByWatch} prevAvgByWatch={prevAvgByWatch} />

      <div className="main">
        <Sidebar
          catalog={CATALOG}
          activeId={activeId}
          onPick={setActiveId}
          query={query}
          setQuery={setQuery}
          liveAvgByWatch={liveAvgByWatch}
          prevAvgByWatch={prevAvgByWatch}
          thresholds={thresholds}
        />

        <div className="col col-mid">
          <SpecBar watch={watch} summary={summary} />
          <HeroPanel
            watch={watch}
            summary={summary}
            verdict={v}
            loading={loading}
            prevAvg={prevAvgByWatch[activeId]}
            threshold={activeThr}
          />
          <HistoryChart
            history={history}
            summary={summary}
            watch={watch}
            range={range}
            onRange={setRange}
            marketNote={marketNote}
            threshold={activeThr}
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
            { value: 'classic',   label: 'Classic'   },
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

        <TweakSection label={'Price alert · ' + watch.nick} />
        {activeThr ? (
          <div style={{ fontFamily: 'var(--mono, monospace)', fontSize: 11, padding: '6px 0', color: '#29261b', lineHeight: 1.5 }}>
            Active: avg {activeThr.dir} <b>${activeThr.price.toLocaleString('en-US')}</b>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--mono, monospace)', fontSize: 11, padding: '6px 0', color: 'rgba(41,38,27,.45)', lineHeight: 1.5 }}>
            No alert set for this watch.
          </div>
        )}
        <TweakNumber
          label="Target price"
          value={thrPrice}
          min={1}
          step={50}
          unit="$"
          onChange={setThrPrice}
        />
        <TweakRadio
          label="Direction"
          value={thrDir}
          options={[
            { value: 'below', label: 'Below' },
            { value: 'above', label: 'Above' },
          ]}
          onChange={setThrDir}
        />
        <TweakButton
          label={activeThr ? 'Update alert' : 'Set alert'}
          onClick={() => {
            setThreshold(activeId, thrPrice, thrDir);
            addAlert(
              `<b>ALERT SET</b> ${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()} — notify if avg goes ${thrDir} <b>${fmt(thrPrice)}</b>.`,
              'ALR', 'mid'
            );
          }}
        />
        {activeThr && (
          <TweakButton
            label="Clear alert"
            secondary
            onClick={() => {
              clearThreshold(activeId);
              addAlert(`<b>ALERT CLEARED</b> ${watch.brand.toUpperCase()} ${watch.nick.toUpperCase()}.`, 'ALR', 'low');
            }}
          />
        )}
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

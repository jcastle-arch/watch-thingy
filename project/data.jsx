// data.jsx — seed watch catalog + LLM price fetch

const RETAILERS = [
  { id: 'oem',      name: 'OEM',              kind: 'OEM',   tag: 'BRAND BOUTIQUE' },
  { id: 'joma',     name: 'Jomashop',         kind: 'GRY',   tag: 'GREY MARKET' },
  { id: 'hodinkee', name: 'Hodinkee Shop',    kind: 'AD',    tag: 'AUTHORIZED' },
  { id: 'crown',    name: 'Crown & Caliber',  kind: 'PRE',   tag: 'PRE-OWNED' },
  { id: 'bobs',     name: "Bob's Watches",    kind: 'PRE',   tag: 'PRE-OWNED' },
  { id: 'wbox',     name: 'WatchBox',         kind: 'PRE',   tag: 'PRE-OWNED' },
  { id: 'c24',      name: 'Chrono24',         kind: 'MKT',   tag: 'MARKETPLACE' },
];

// Per-brand OEM site name
const BRAND_SITES = {
  'Omega':           'Omega.com',
  'Rolex':           'Rolex.com',
  'Tudor':           'Tudorwatch.com',
  'Patek Philippe':  'Patek.com',
  'Audemars Piguet': 'AudemarsPiguet.com',
  'TAG Heuer':       'TagHeuer.com',
};

// Six watches in the watchlist — Speedmaster is the focus
const CATALOG = [
  {
    id: 'omega-speedy-pro',
    brand: 'Omega',
    model: 'Speedmaster Professional Moonwatch',
    ref:   '310.30.42.50.01.001',
    nick:  'Moonwatch',
    case:  '42mm Steel',
    movement: 'Co-Axial Master Chrono. Cal. 3861',
    year:  '2021–',
    msrp:  7400,
    avg:   6892,
    lastAvg: 6973,
    range: [5895, 7400],
    image: 'speedy',
    photo: 'photos/speedmaster.avif',
    alerts: 2,
  },
  {
    id: 'rolex-sub-126610ln',
    brand: 'Rolex',
    model: 'Submariner Date',
    ref:   '126610LN',
    nick:  'Sub Date',
    case:  '41mm Steel',
    movement: 'Cal. 3235',
    year:  '2020–',
    msrp:  10250,
    avg:   13420,
    lastAvg: 13180,
    range: [12100, 14900],
    image: 'sub',
    photo: 'photos/submariner.avif',
    alerts: 0,
  },
  {
    id: 'tudor-bb58',
    brand: 'Tudor',
    model: 'Black Bay 58',
    ref:   'M79030N-0001',
    nick:  'BB58',
    case:  '39mm Steel',
    movement: 'Cal. MT5402',
    year:  '2018–',
    msrp:  3950,
    avg:   3265,
    lastAvg: 3320,
    range: [2950, 3950],
    image: 'bb58',
    photo: 'photos/bb58.avif',
    alerts: 1,
  },
  {
    id: 'patek-5711-1a',
    brand: 'Patek Philippe',
    model: 'Nautilus 5711/1A-010',
    ref:   '5711/1A-010',
    nick:  'Nautilus Blue',
    case:  '40mm Steel',
    movement: 'Cal. 26-330 S C',
    year:  '2006–2021',
    msrp:  35000,
    avg:   192500,
    lastAvg: 198750,
    range: [165000, 225000],
    image: 'naut',
    photo: 'photos/nautilus.avif',
    alerts: 3,
  },
  {
    id: 'ap-15500st',
    brand: 'Audemars Piguet',
    model: 'Royal Oak 15500ST',
    ref:   '15500ST.OO.1220ST.03',
    nick:  'Royal Oak Blue',
    case:  '41mm Steel',
    movement: 'Cal. 4302',
    year:  '2019–',
    msrp:  29900,
    avg:   58420,
    lastAvg: 57100,
    range: [52500, 64900],
    image: 'ro',
    photo: 'photos/royal-oak.avif',
    alerts: 1,
  },
  {
    id: 'tag-heuer-cbn2010',
    brand: 'TAG Heuer',
    model: 'Carrera Chronograph',
    ref:   'CBN2010.BA0642',
    nick:  'Carrera 42',
    case:  '42mm Steel',
    movement: 'Heuer 02',
    year:  '2020–',
    msrp:  6450,
    avg:   4895,
    lastAvg: 4920,
    range: [4250, 6450],
    image: 'carrera',
    photo: 'photos/carrera.avif',
    alerts: 0,
  },
];

// 7-retailer price snapshots per watch (seed; refreshed by claude.complete)
// price, stock: in|low|out|preorder, condition: NEW|UNW|EXC|GD, days since update
const SEED_QUOTES = {
  'omega-speedy-pro': [
    { id: 'oem',      px: 7400, stock: 'in',  cond: 'NEW', age: 4,  url: '#' },
    { id: 'joma',     px: 6125, stock: 'in',  cond: 'NEW', age: 1,  url: '#' },
    { id: 'hodinkee', px: 7400, stock: 'low', cond: 'NEW', age: 6,  url: '#' },
    { id: 'crown',    px: 6595, stock: 'in',  cond: 'UNW', age: 3,  url: '#' },
    { id: 'bobs',     px: 6890, stock: 'in',  cond: 'EXC', age: 2,  url: '#' },
    { id: 'wbox',     px: 7195, stock: 'in',  cond: 'UNW', age: 9,  url: '#' },
    { id: 'c24',      px: 6645, stock: 'in',  cond: 'EXC', age: 1,  url: '#' },
  ],
  'rolex-sub-126610ln': [
    { id: 'oem',      px: 10250, stock: 'out', cond: 'NEW', age: 14, url: '#' },
    { id: 'joma',     px: 13950, stock: 'in',  cond: 'NEW', age: 2,  url: '#' },
    { id: 'hodinkee', px: 14250, stock: 'low', cond: 'NEW', age: 4,  url: '#' },
    { id: 'crown',    px: 12990, stock: 'in',  cond: 'UNW', age: 1,  url: '#' },
    { id: 'bobs',     px: 12895, stock: 'in',  cond: 'EXC', age: 1,  url: '#' },
    { id: 'wbox',     px: 13750, stock: 'in',  cond: 'UNW', age: 5,  url: '#' },
    { id: 'c24',      px: 13125, stock: 'in',  cond: 'EXC', age: 1,  url: '#' },
  ],
  'tudor-bb58': [
    { id: 'oem',      px: 3950, stock: 'in',  cond: 'NEW', age: 6,  url: '#' },
    { id: 'joma',     px: 2895, stock: 'in',  cond: 'NEW', age: 1,  url: '#' },
    { id: 'hodinkee', px: 3950, stock: 'in',  cond: 'NEW', age: 4,  url: '#' },
    { id: 'crown',    px: 2995, stock: 'in',  cond: 'UNW', age: 2,  url: '#' },
    { id: 'bobs',     px: 3145, stock: 'in',  cond: 'EXC', age: 3,  url: '#' },
    { id: 'wbox',     px: 3395, stock: 'low', cond: 'UNW', age: 7,  url: '#' },
    { id: 'c24',      px: 3125, stock: 'in',  cond: 'EXC', age: 1,  url: '#' },
  ],
  'patek-5711-1a': [
    { id: 'oem',      px: null,   stock: 'out',     cond: '—',   age: 99, url: '#' },
    { id: 'joma',     px: 195000, stock: 'low',     cond: 'UNW', age: 8,  url: '#' },
    { id: 'hodinkee', px: 215000, stock: 'preorder',cond: 'NEW', age: 4,  url: '#' },
    { id: 'crown',    px: 178500, stock: 'in',      cond: 'EXC', age: 3,  url: '#' },
    { id: 'bobs',     px: 185000, stock: 'in',      cond: 'EXC', age: 2,  url: '#' },
    { id: 'wbox',     px: 210000, stock: 'low',     cond: 'UNW', age: 6,  url: '#' },
    { id: 'c24',      px: 178900, stock: 'in',      cond: 'EXC', age: 1,  url: '#' },
  ],
  'ap-15500st': [
    { id: 'oem',      px: 29900, stock: 'out',     cond: 'NEW', age: 30, url: '#' },
    { id: 'joma',     px: 56950, stock: 'in',      cond: 'UNW', age: 3,  url: '#' },
    { id: 'hodinkee', px: 64900, stock: 'low',     cond: 'NEW', age: 5,  url: '#' },
    { id: 'crown',    px: 54500, stock: 'in',      cond: 'EXC', age: 2,  url: '#' },
    { id: 'bobs',     px: 56250, stock: 'in',      cond: 'EXC', age: 4,  url: '#' },
    { id: 'wbox',     px: 60125, stock: 'in',      cond: 'UNW', age: 6,  url: '#' },
    { id: 'c24',      px: 56895, stock: 'in',      cond: 'EXC', age: 1,  url: '#' },
  ],
  'tag-heuer-cbn2010': [
    { id: 'oem',      px: 6450, stock: 'in',  cond: 'NEW', age: 4,  url: '#' },
    { id: 'joma',     px: 3995, stock: 'in',  cond: 'NEW', age: 2,  url: '#' },
    { id: 'hodinkee', px: 6450, stock: 'in',  cond: 'NEW', age: 6,  url: '#' },
    { id: 'crown',    px: 4495, stock: 'in',  cond: 'UNW', age: 3,  url: '#' },
    { id: 'bobs',     px: 4895, stock: 'in',  cond: 'EXC', age: 5,  url: '#' },
    { id: 'wbox',     px: 5295, stock: 'low', cond: 'UNW', age: 8,  url: '#' },
    { id: 'c24',      px: 4625, stock: 'in',  cond: 'EXC', age: 1,  url: '#' },
  ],
};

// 30-day seed history per watch — [{d: daysAgo, avg, lo, hi}, ...]
function genHistory(watch) {
  const days = 90;
  const out = [];
  const avgBase = watch.avg;
  const drift = (avgBase - watch.lastAvg) / 30;
  let rng = (seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; })(
    watch.id.charCodeAt(0) * 1000 + watch.id.charCodeAt(3)
  );
  for (let i = days; i >= 0; i--) {
    const trend = drift * i;
    const noise = (rng() - 0.5) * avgBase * 0.025;
    const swing = (rng() - 0.5) * avgBase * 0.015;
    const v = avgBase - trend + noise + swing;
    out.push({
      d: i,
      avg: Math.round(v),
      lo: Math.round(v * (0.91 - rng() * 0.02)),
      hi: Math.round(v * (1.09 + rng() * 0.02)),
      msrp: watch.msrp,
    });
  }
  return out;
}

// Compute summary stats from a quotes array (filtered to active retailers)
function summarize(quotes, msrp) {
  const active = quotes.filter(q => q.px != null);
  const prices = active.map(q => q.px);
  if (prices.length === 0) return { avg: 0, lo: 0, hi: 0, median: 0, stdev: 0, n: 0 };
  const sum = prices.reduce((a, b) => a + b, 0);
  const avg = sum / prices.length;
  const sorted = [...prices].sort((a, b) => a - b);
  const median = sorted.length % 2
    ? sorted[(sorted.length - 1) >> 1]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const variance = prices.reduce((a, p) => a + (p - avg) ** 2, 0) / prices.length;
  const stdev = Math.sqrt(variance);
  return {
    avg: Math.round(avg),
    lo: sorted[0],
    hi: sorted[sorted.length - 1],
    median: Math.round(median),
    stdev: Math.round(stdev),
    n: prices.length,
    spread: sorted[sorted.length - 1] - sorted[0],
    msrpDelta: avg - msrp,
  };
}

// Verdict logic: compare AVG vs MSRP and dispersion
function verdict(s, msrp) {
  if (s.n === 0) return { code: 'NO DATA', tone: 'fair', note: 'No live quotes available.' };
  const pct = ((s.avg - msrp) / msrp) * 100;
  if (pct < -10) return { code: 'STRONG BUY', tone: 'deal',
    note: `Market trading ${Math.abs(pct).toFixed(1)}% below MSRP. Grey-market discount window.` };
  if (pct < -3) return { code: 'BUY ZONE', tone: 'deal',
    note: `Average ${Math.abs(pct).toFixed(1)}% under retail. Fair entry point.` };
  if (pct < 5) return { code: 'AT RETAIL', tone: 'fair',
    note: `Market clearing near MSRP (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%). No discount edge.` };
  if (pct < 50) return { code: 'PREMIUM', tone: 'over',
    note: `Trading ${pct.toFixed(1)}% over retail. Heat in the secondary market.` };
  return { code: 'HOT MARKET', tone: 'over',
    note: `Premium of ${pct.toFixed(0)}% over MSRP — speculative pricing.` };
}

// LLM refresh — asks claude for fresh quote variations.
// Returns a Promise<{quotes, refreshedAt}> or null on failure.
async function fetchLiveQuotes(watch, currentQuotes) {
  if (!window.claude || !window.claude.complete) return null;

  const list = currentQuotes.map(q => `${q.id}=${q.px ?? 'null'}`).join(', ');
  const prompt = `You are a pricing oracle for a watch reseller's internal terminal.
Given the current market snapshot for ${watch.brand} ${watch.model} (ref ${watch.ref}, MSRP $${watch.msrp}):
Current quotes: ${list}

Simulate a fresh market update — a small realistic intraday shift in prices.
Each retailer's new price should drift by -3% to +3% from the current quote.
The OEM (omega) stays at MSRP. Marketplace (c24) can swing slightly more.
If current is null, keep it null.

Return STRICT JSON only, no prose, no markdown fences:
{"quotes":[{"id":"omega","px":7400},{"id":"joma","px":6135},...all 7 retailers...],"note":"one short market note ≤14 words"}`;

  try {
    const raw = await window.claude.complete(prompt);
    const jsonStr = raw.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (!parsed.quotes || !Array.isArray(parsed.quotes)) return null;
    const map = Object.fromEntries(parsed.quotes.map(q => [q.id, q.px]));
    const updated = currentQuotes.map(q => ({
      ...q,
      px: q.px == null ? null : (map[q.id] ?? q.px),
      age: 0,
    }));
    return { quotes: updated, note: parsed.note || '', refreshedAt: Date.now() };
  } catch (e) {
    console.warn('[wpx] live fetch failed:', e);
    return null;
  }
}

// Initial alerts log
const SEED_ALERTS = [
  { id: 1, t: '14:32:08', tag: 'PX',   sev: 'high', html: '<b>OMEGA SPEEDY PRO</b> avg crossed <span class="dn">−1.2%</span> WoW threshold ($6,892).' },
  { id: 2, t: '14:29:51', tag: 'ALR',  sev: 'mid',  html: '<b>NAUTILUS 5711/1A</b> Chrono24 listing posted at <span class="dn">$178,900</span> — below your alert.' },
  { id: 3, t: '14:18:03', tag: 'STK',  sev: 'low',  html: '<b>BB58</b> back IN STOCK at Hodinkee Shop ($3,950 retail).' },
  { id: 4, t: '14:11:47', tag: 'PX',   sev: 'mid',  html: '<b>ROYAL OAK 15500ST</b> avg <span class="up">+2.3%</span> 24h, premium widening vs MSRP.' },
  { id: 5, t: '14:02:19', tag: 'NEWS', sev: 'low',  html: 'Omega announces 4% price increase, eff. 01-JUN. <span class="up">Spot prices likely to follow.</span>' },
  { id: 6, t: '13:55:02', tag: 'PX',   sev: 'low',  html: '<b>SUB 126610LN</b> Jomashop quote <span class="up">+$150</span> intraday.' },
  { id: 7, t: '13:41:38', tag: 'STK',  sev: 'low',  html: '<b>CARRERA 42</b> WatchBox marked LOW STOCK (1 remaining).' },
  { id: 8, t: '13:30:00', tag: 'SYS',  sev: 'low',  html: 'Session opened. 7 sources synced. <span class="up">All feeds nominal.</span>' },
];

window.WPX_DATA = {
  RETAILERS, CATALOG, SEED_QUOTES, SEED_ALERTS, BRAND_SITES,
  genHistory, summarize, verdict, fetchLiveQuotes,
};

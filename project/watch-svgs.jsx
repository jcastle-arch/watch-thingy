// watch-svgs.jsx — schematic line drawings of each tracked watch.
// Drawn in technical-blueprint style to match the trading-floor aesthetic.
// All use currentColor for stroke so they inherit theme colors.

function WatchSpeedy({ size = 200, accent = false }) {
  // Omega Speedmaster Professional — 3 chrono subdials, tachymeter bezel, lyre lugs
  const s = size;
  return (
    <svg viewBox="0 0 200 200" width={s} height={s} fill="none" stroke="currentColor"
         strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* lugs */}
      <path d="M 65 28 L 58 18 L 52 36 M 135 28 L 142 18 L 148 36 M 65 172 L 58 182 L 52 164 M 135 172 L 142 182 L 148 164" />
      {/* tachymeter bezel ring */}
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="68" />
      {/* tachy ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const r1 = 70, r2 = i % 5 === 0 ? 75 : 73;
        return <line key={i}
          x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1}
          x2={100 + Math.cos(a) * r2} y2={100 + Math.sin(a) * r2}
          strokeWidth={i % 5 === 0 ? 1.4 : 0.8} />;
      })}
      {/* TACHYMÈTRE word arc indicator */}
      <text x="100" y="36" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none"
            fontFamily="var(--sans)" letterSpacing="1.2">TACHYMETRE · BASE 1000</text>
      {/* dial */}
      <circle cx="100" cy="100" r="62" />
      {/* hour indices */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 100 + Math.cos(a) * 55, y1 = 100 + Math.sin(a) * 55;
        const x2 = 100 + Math.cos(a) * 60, y2 = 100 + Math.sin(a) * 60;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.4" />;
      })}
      {/* 3 chronograph subdials: 9, 12 area (running secs at 9, mins at 3, hours at 6) actually for Speedy: 3=mins, 6=hrs, 9=secs */}
      {[[68, 100], [100, 132], [132, 100]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="14" strokeWidth="0.9" />
          {Array.from({ length: 12 }, (_, j) => {
            const a = (j / 12) * Math.PI * 2 - Math.PI / 2;
            return <line key={j}
              x1={cx + Math.cos(a) * 11} y1={cy + Math.sin(a) * 11}
              x2={cx + Math.cos(a) * 13} y2={cy + Math.sin(a) * 13}
              strokeWidth="0.5" />;
          })}
          {/* subdial hand */}
          <line x1={cx} y1={cy} x2={cx + (i === 0 ? -8 : i === 1 ? 4 : -6)} y2={cy + (i === 0 ? 4 : i === 1 ? 8 : -4)} strokeWidth="0.8" />
        </g>
      ))}
      {/* central hands */}
      <line x1="100" y1="100" x2="100" y2="58" strokeWidth="2" />
      <line x1="100" y1="100" x2="130" y2="100" strokeWidth="1.6" />
      <line x1="100" y1="100" x2="100" y2="48" strokeWidth="1" stroke={accent ? 'var(--amber)' : 'currentColor'} />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" stroke="none" />
      {/* crown & pushers right side */}
      <rect x="178" y="84" width="6" height="6" />
      <rect x="178" y="97" width="8" height="6" />
      <rect x="178" y="110" width="6" height="6" />
    </svg>
  );
}

function WatchSub({ size = 200, accent = false }) {
  // Rolex Submariner 126610LN — dive bezel, Mercedes hands, crown guards
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* oyster lugs (thicker) */}
      <path d="M 60 30 L 60 18 L 80 30 M 140 30 L 140 18 L 120 30 M 60 170 L 60 182 L 80 170 M 140 170 L 140 182 L 120 170" />
      {/* unidirectional bezel */}
      <circle cx="100" cy="100" r="80" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="68" />
      {/* triangle pip at 12 */}
      <path d="M 96 24 L 100 32 L 104 24 Z" fill="currentColor" stroke="none" />
      {/* bezel minute marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        return <line key={i}
          x1={100 + Math.cos(a) * 70} y1={100 + Math.sin(a) * 70}
          x2={100 + Math.cos(a) * (i % 5 === 0 ? 76 : 74)} y2={100 + Math.sin(a) * (i % 5 === 0 ? 76 : 74)}
          strokeWidth={i % 5 === 0 ? 1.3 : 0.6} />;
      })}
      {/* dial */}
      <circle cx="100" cy="100" r="60" />
      {/* hour markers — round dots */}
      {Array.from({ length: 12 }, (_, i) => {
        if (i === 0 || i === 6 || i === 9) return null;
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 100 + Math.cos(a) * 50, y = 100 + Math.sin(a) * 50;
        return <circle key={i} cx={x} cy={y} r="3" fill="currentColor" stroke="none" />;
      })}
      {/* 12 triangle, 6 & 9 bars */}
      <path d="M 96 46 L 100 54 L 104 46 Z" fill="currentColor" stroke="none" />
      <rect x="98" y="142" width="4" height="8" fill="currentColor" stroke="none" />
      <rect x="46" y="98" width="8" height="4" fill="currentColor" stroke="none" />
      {/* date window at 3 */}
      <rect x="142" y="96" width="10" height="9" />
      {/* Mercedes hour hand */}
      <line x1="100" y1="100" x2="100" y2="70" strokeWidth="3" />
      <circle cx="100" cy="72" r="4" />
      <line x1="100" y1="69" x2="100" y2="74" strokeWidth="1" />
      <line x1="97" y1="71" x2="103" y2="71" strokeWidth="1" />
      {/* minute hand */}
      <line x1="100" y1="100" x2="135" y2="100" strokeWidth="2.5" />
      {/* second hand */}
      <line x1="100" y1="100" x2="100" y2="52" strokeWidth="0.8" stroke={accent ? 'var(--amber)' : 'currentColor'} />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" stroke="none" />
      {/* crown guards + crown */}
      <path d="M 178 95 L 184 95 L 184 105 L 178 105 Z" />
      <rect x="180" y="92" width="6" height="3" />
      <rect x="180" y="105" width="6" height="3" />
    </svg>
  );
}

function WatchBB58({ size = 200, accent = false }) {
  // Tudor Black Bay 58 — snowflake hand, dive bezel, no crown guard
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 60 30 L 56 18 L 78 30 M 140 30 L 144 18 L 122 30 M 60 170 L 56 182 L 78 170 M 140 170 L 144 182 L 122 170" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="66" />
      <path d="M 95 25 L 100 32 L 105 25 Z" fill="currentColor" stroke="none" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        return <line key={i}
          x1={100 + Math.cos(a) * 68} y1={100 + Math.sin(a) * 68}
          x2={100 + Math.cos(a) * (i % 5 === 0 ? 74 : 72)} y2={100 + Math.sin(a) * (i % 5 === 0 ? 74 : 72)}
          strokeWidth={i % 5 === 0 ? 1.3 : 0.6} />;
      })}
      <circle cx="100" cy="100" r="58" />
      {/* hour indices - round */}
      {Array.from({ length: 12 }, (_, i) => {
        if (i === 0) return null;
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={100 + Math.cos(a) * 48} cy={100 + Math.sin(a) * 48} r="3" fill="currentColor" stroke="none" />;
      })}
      <path d="M 95 46 L 100 54 L 105 46 Z" fill="currentColor" stroke="none" />
      {/* Tudor rose at 6 (simplified) */}
      <circle cx="100" cy="130" r="6" strokeWidth="0.7" />
      <text x="100" y="133" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor"
            fontFamily="var(--serif)" fontStyle="italic">T</text>
      {/* snowflake hour hand */}
      <path d="M 100 100 L 96 80 L 100 72 L 104 80 Z" fill="currentColor" stroke="none" />
      <line x1="100" y1="72" x2="100" y2="60" strokeWidth="2" />
      {/* minute snowflake */}
      <path d="M 100 100 L 116 96 L 128 100 L 116 104 Z" fill="currentColor" stroke="none" />
      {/* second */}
      <line x1="100" y1="100" x2="100" y2="55" strokeWidth="0.8" stroke={accent ? 'var(--amber)' : 'currentColor'} />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" stroke="none" />
      <rect x="178" y="96" width="8" height="8" />
    </svg>
  );
}

function WatchNautilus({ size = 200, accent = false }) {
  // Patek Nautilus 5711 — rounded octagonal case with "ears", embossed horizontal dial
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* horizontal "ears" — Nautilus signature */}
      <path d="M 22 75 L 22 125 L 32 125 L 36 115 L 36 85 L 32 75 Z" />
      <path d="M 178 75 L 178 125 L 168 125 L 164 115 L 164 85 L 168 75 Z" />
      {/* rounded octagonal bezel */}
      <path d="M 60 26 L 140 26 Q 170 26 174 56 L 174 144 Q 170 174 140 174 L 60 174 Q 30 174 26 144 L 26 56 Q 30 26 60 26 Z" strokeWidth="1.6" />
      {/* inner case rim */}
      <path d="M 64 36 L 136 36 Q 160 36 164 60 L 164 140 Q 160 164 136 164 L 64 164 Q 40 164 36 140 L 36 60 Q 40 36 64 36 Z" />
      {/* dial inner */}
      <circle cx="100" cy="100" r="56" strokeWidth="0.7" />
      {/* horizontal embossed dial lines */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={56} y1={70 + i * 8} x2={144} y2={70 + i * 8} strokeWidth="0.4" opacity="0.55" />
      ))}
      {/* baton hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 100 + Math.cos(a) * 46, y1 = 100 + Math.sin(a) * 46;
        const x2 = 100 + Math.cos(a) * 51, y2 = 100 + Math.sin(a) * 51;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" />;
      })}
      {/* date at 3 */}
      <rect x="138" y="95" width="14" height="10" />
      <text x="145" y="103" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor"
            fontFamily="var(--mono)">21</text>
      {/* hands */}
      <line x1="100" y1="100" x2="100" y2="68" strokeWidth="2.4" />
      <line x1="100" y1="100" x2="132" y2="100" strokeWidth="2" />
      <line x1="100" y1="100" x2="100" y2="58" strokeWidth="0.8" stroke={accent ? 'var(--amber)' : 'currentColor'} />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WatchRoyalOak({ size = 200, accent = false }) {
  // AP Royal Oak 15500ST — octagonal bezel w/ 8 screws, tapisserie pattern
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* outer case (slightly rounded) */}
      <path d="M 100 20 L 152 38 L 180 90 L 180 110 L 152 162 L 100 180 L 48 162 L 20 110 L 20 90 L 48 38 Z" />
      {/* octagonal bezel */}
      <path d="M 100 32 L 142 47 L 168 90 L 168 110 L 142 153 L 100 168 L 58 153 L 32 110 L 32 90 L 58 47 Z" strokeWidth="1.6" />
      {/* 8 hex screws at corners */}
      {[[100,38],[140,52],[164,90],[164,110],[140,148],[100,162],[60,148],[36,110],[36,90],[60,52]].map(([cx,cy],i)=>(
        <g key={i}>
          <circle cx={cx} cy={cy} r="2.5" strokeWidth="0.8" />
          <line x1={cx-1.5} y1={cy} x2={cx+1.5} y2={cy} strokeWidth="0.7" />
        </g>
      ))}
      {/* dial */}
      <circle cx="100" cy="100" r="52" strokeWidth="0.7" />
      {/* tapisserie suggestion — grid pattern */}
      <pattern id="tap" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" />
        <circle cx="3" cy="3" r="0.5" fill="currentColor" opacity="0.3" />
      </pattern>
      <circle cx="100" cy="100" r="50" fill="url(#tap)" stroke="none" />
      {/* baton hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <line key={i}
          x1={100 + Math.cos(a) * 42} y1={100 + Math.sin(a) * 42}
          x2={100 + Math.cos(a) * 48} y2={100 + Math.sin(a) * 48}
          strokeWidth="2" />;
      })}
      {/* date at 3 */}
      <rect x="136" y="95" width="14" height="10" />
      {/* hands — sharp tapered */}
      <path d="M 100 100 L 98 72 L 100 64 L 102 72 Z" fill="currentColor" stroke="none" />
      <path d="M 100 100 L 130 98 L 138 100 L 130 102 Z" fill="currentColor" stroke="none" />
      <line x1="100" y1="100" x2="100" y2="55" strokeWidth="0.8" stroke={accent ? 'var(--amber)' : 'currentColor'} />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WatchCarrera({ size = 200, accent = false }) {
  // TAG Heuer Carrera CBN2010 — round case, 3 subdials, tachy bezel
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 64 28 L 56 18 L 50 38 M 136 28 L 144 18 L 150 38 M 64 172 L 56 182 L 50 162 M 136 172 L 144 182 L 150 162" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="68" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="60" />
      {/* tachy ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        return <line key={i}
          x1={100 + Math.cos(a) * 62} y1={100 + Math.sin(a) * 62}
          x2={100 + Math.cos(a) * (i % 5 === 0 ? 67 : 65)} y2={100 + Math.sin(a) * (i % 5 === 0 ? 67 : 65)}
          strokeWidth={i % 5 === 0 ? 1.1 : 0.5} />;
      })}
      {/* applied indices */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <line key={i}
          x1={100 + Math.cos(a) * 50} y1={100 + Math.sin(a) * 50}
          x2={100 + Math.cos(a) * 56} y2={100 + Math.sin(a) * 56}
          strokeWidth="1.6" />;
      })}
      {/* 3 subdials at 3, 6, 9 */}
      {[[68, 100], [100, 132], [132, 100]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="13" strokeWidth="0.9" />
          {Array.from({ length: 12 }, (_, j) => {
            const a = (j / 12) * Math.PI * 2 - Math.PI / 2;
            return <line key={j}
              x1={cx + Math.cos(a) * 10} y1={cy + Math.sin(a) * 10}
              x2={cx + Math.cos(a) * 12} y2={cy + Math.sin(a) * 12}
              strokeWidth="0.4" />;
          })}
          <line x1={cx} y1={cy} x2={cx + [-7,5,-3][i]} y2={cy + [3,-7,-6][i]} strokeWidth="0.8" />
        </g>
      ))}
      {/* central hands */}
      <line x1="100" y1="100" x2="100" y2="56" strokeWidth="2.2" />
      <line x1="100" y1="100" x2="132" y2="100" strokeWidth="1.8" />
      <line x1="100" y1="100" x2="100" y2="50" strokeWidth="0.8" stroke={accent ? 'var(--amber)' : 'currentColor'} />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" stroke="none" />
      <rect x="178" y="84" width="6" height="6" />
      <rect x="178" y="97" width="8" height="6" />
      <rect x="178" y="110" width="6" height="6" />
    </svg>
  );
}

function WatchSVG({ id, size = 200, accent = false }) {
  const Comp = {
    'speedy':  WatchSpeedy,
    'sub':     WatchSub,
    'bb58':    WatchBB58,
    'naut':    WatchNautilus,
    'ro':      WatchRoyalOak,
    'carrera': WatchCarrera,
  }[id] || WatchSpeedy;
  return <Comp size={size} accent={accent} />;
}

Object.assign(window, { WatchSVG });

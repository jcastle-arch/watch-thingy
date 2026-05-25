// admin.jsx — passphrase gate + add/remove custom watches

const ADMIN_PASS = 'james william castle';
const LS_CUSTOM  = 'wpx-custom-watches';

function loadCustomWatches() {
  try { return JSON.parse(localStorage.getItem(LS_CUSTOM)) || []; } catch { return []; }
}

function saveCustomWatches(watches) {
  try { localStorage.setItem(LS_CUSTOM, JSON.stringify(watches)); } catch {}
}

function makeDefaultQuotes(msrp) {
  const p = msrp || 1000;
  return [
    { id: 'oem',      px: p,                    stock: 'in',  cond: 'NEW', age: 0, url: '#' },
    { id: 'joma',     px: Math.round(p * 0.85), stock: 'in',  cond: 'NEW', age: 1, url: '#' },
    { id: 'hodinkee', px: p,                    stock: 'low', cond: 'NEW', age: 3, url: '#' },
    { id: 'crown',    px: Math.round(p * 0.80), stock: 'in',  cond: 'UNW', age: 2, url: '#' },
    { id: 'bobs',     px: Math.round(p * 0.82), stock: 'in',  cond: 'EXC', age: 2, url: '#' },
    { id: 'wbox',     px: Math.round(p * 0.88), stock: 'in',  cond: 'UNW', age: 4, url: '#' },
    { id: 'c24',      px: Math.round(p * 0.83), stock: 'in',  cond: 'EXC', age: 1, url: '#' },
  ];
}

// ── Passphrase gate ────────────────────────────────────────────
function PassphraseModal({ onSuccess, onCancel }) {
  const [val, setVal] = React.useState('');
  const [err, setErr] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const submit = () => {
    if (val.trim().toLowerCase() === ADMIN_PASS) {
      onSuccess();
    } else {
      setErr(true);
      setVal('');
      setTimeout(() => setErr(false), 1400);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <span className="modal-title">◈ ADMIN ACCESS</span>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-hint">Enter your passphrase to unlock catalog editing.</p>
          <div className="modal-field">
            <label className="modal-label">PASSPHRASE</label>
            <input
              ref={inputRef}
              type="password"
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
              className={'modal-input' + (err ? ' err' : '')}
              placeholder="···"
              autoComplete="off"
            />
            {err && <span className="modal-err-msg">Incorrect passphrase.</span>}
          </div>
          <button className="modal-btn" onClick={submit}>UNLOCK</button>
        </div>
      </div>
    </div>
  );
}

// ── Add watch form ─────────────────────────────────────────────
const WATCH_SVG_IDS = ['speedy', 'sub', 'bb58', 'naut', 'ro', 'carrera'];

function AddWatchModal({ onAdd, onCancel }) {
  const [form, setForm] = React.useState({
    brand: '', model: '', ref: '', nick: '',
    case: '', movement: '', year: new Date().getFullYear() + '–',
    msrp: '', image: 'speedy',
  });
  const [errors, setErrors] = React.useState({});

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.brand.trim())                               e.brand = 'Required';
    if (!form.model.trim())                               e.model = 'Required';
    if (!form.nick.trim())                                e.nick  = 'Required';
    if (!form.msrp || isNaN(+form.msrp) || +form.msrp <= 0) e.msrp = 'Valid price required';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const msrp = Math.round(+form.msrp);
    const avg  = Math.round(msrp * 0.87);
    const watch = {
      id:       'custom-' + Date.now(),
      brand:    form.brand.trim(),
      model:    form.model.trim(),
      ref:      form.ref.trim()      || '—',
      nick:     form.nick.trim(),
      case:     form.case.trim()     || '—',
      movement: form.movement.trim() || '—',
      year:     form.year.trim()     || '—',
      msrp, avg, lastAvg: avg,
      range:    [Math.round(avg * 0.9), msrp],
      image:    form.image,
      photo:    '',
      alerts:   0,
      custom:   true,
    };
    onAdd(watch, makeDefaultQuotes(msrp));
  };

  const Field = ({ label, k, type = 'text', placeholder = '' }) => (
    <div className="modal-field">
      <label className="modal-label">
        {label}
        {errors[k] && <span className="modal-err-msg"> · {errors[k]}</span>}
      </label>
      <input
        type={type}
        className={'modal-input' + (errors[k] ? ' err' : '')}
        value={form[k]}
        placeholder={placeholder}
        onChange={e => set(k, e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
      />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <span className="modal-title">+ ADD WATCH TO CATALOG</span>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-grid">
            <Field label="BRAND *"       k="brand"    placeholder="e.g. Rolex" />
            <Field label="MODEL *"       k="model"    placeholder="e.g. Datejust 41" />
            <Field label="NICKNAME *"    k="nick"     placeholder="e.g. DJ41" />
            <Field label="REFERENCE"     k="ref"      placeholder="e.g. 126334" />
            <Field label="CASE"          k="case"     placeholder="e.g. 41mm Steel" />
            <Field label="MOVEMENT"      k="movement" placeholder="e.g. Cal. 3235" />
            <Field label="YEAR"          k="year"     placeholder="e.g. 2021–" />
            <Field label="MSRP USD *"    k="msrp"     type="number" placeholder="e.g. 8100" />
          </div>

          <div className="modal-field">
            <label className="modal-label">SCHEMATIC</label>
            <div className="modal-svgs">
              {WATCH_SVG_IDS.map(id => (
                <div
                  key={id}
                  className={'modal-svg-opt' + (form.image === id ? ' on' : '')}
                  onClick={() => set('image', id)}
                  title={id}
                >
                  <WatchSVG id={id} size={44} />
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="modal-btn" onClick={submit}>ADD TO WATCHLIST</button>
            <button className="modal-btn modal-btn-sec" onClick={onCancel}>CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WPX_ADMIN = {
  loadCustomWatches, saveCustomWatches, makeDefaultQuotes,
  PassphraseModal, AddWatchModal,
};

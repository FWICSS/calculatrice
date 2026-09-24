import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Background from "./components/Background";
import { pulse } from "./pulse";
import { format, initialState, reducer } from "./engine";

const HISTORY_KEY = "calculatrice.history";

const BASIC_KEYS = [
  { id: "clear", label: "AC", kind: "danger", action: { type: "clear" }, keys: ["Escape", "Delete"] },
  { id: "back", label: "⌫", kind: "fn", aria: "Effacer le dernier chiffre", action: { type: "backspace" }, keys: ["Backspace"] },
  { id: "percent", label: "%", kind: "fn", action: { type: "percent" }, keys: ["%"] },
  { id: "div", label: "÷", kind: "op", action: { type: "operator", operator: "÷" }, keys: ["/"] },
  ...["7", "8", "9"].map(digitKey),
  { id: "mul", label: "×", kind: "op", action: { type: "operator", operator: "×" }, keys: ["*", "x"] },
  ...["4", "5", "6"].map(digitKey),
  { id: "sub", label: "−", kind: "op", action: { type: "operator", operator: "−" }, keys: ["-"] },
  ...["1", "2", "3"].map(digitKey),
  { id: "add", label: "+", kind: "op", action: { type: "operator", operator: "+" }, keys: ["+"] },
  { id: "neg", label: "±", kind: "fn", aria: "Changer le signe", action: { type: "negate" }, keys: [] },
  digitKey("0"),
  { id: "dot", label: ",", kind: "num", action: { type: "dot" }, keys: [".", ","] },
  { id: "eq", label: "=", kind: "equals", action: { type: "equals" }, keys: ["Enter", "="] },
];

const SCI_KEYS = [
  { id: "sin", label: "sin", action: { type: "unary", fn: "sin" }, keys: ["s"] },
  { id: "cos", label: "cos", action: { type: "unary", fn: "cos" }, keys: ["c"] },
  { id: "tan", label: "tan", action: { type: "unary", fn: "tan" }, keys: ["t"] },
  { id: "ln", label: "ln", action: { type: "unary", fn: "ln" }, keys: ["l"] },
  { id: "log", label: "log", action: { type: "unary", fn: "log" }, keys: [] },
  { id: "sqrt", label: "√x", action: { type: "unary", fn: "sqrt" }, keys: ["r"] },
  { id: "sq", label: "x²", action: { type: "unary", fn: "sq" }, keys: [] },
  { id: "cube", label: "x³", action: { type: "unary", fn: "cube" }, keys: [] },
  { id: "pow", label: "xʸ", action: { type: "operator", operator: "^" }, keys: ["^"] },
  { id: "inv", label: "1/x", action: { type: "unary", fn: "inv" }, keys: [] },
  { id: "exp", label: "eˣ", action: { type: "unary", fn: "exp" }, keys: [] },
  { id: "pow10", label: "10ˣ", action: { type: "unary", fn: "pow10" }, keys: [] },
  { id: "pi", label: "π", action: { type: "constant", name: "pi" }, keys: ["p"] },
  { id: "e", label: "e", action: { type: "constant", name: "e" }, keys: ["e"] },
  { id: "fact", label: "n!", action: { type: "unary", fn: "fact" }, keys: ["!"] },
].map((k) => ({ ...k, kind: "sci" }));

function digitKey(d) {
  return { id: `d${d}`, label: d, kind: "num", action: { type: "digit", digit: d }, keys: [d] };
}

function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* stockage indisponible : on garde l'historique en mémoire */
  }
}

function sizeClass(text) {
  if (text.length > 16) return "display__value--xs";
  if (text.length > 12) return "display__value--sm";
  if (text.length > 8) return "display__value--md";
  return "";
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [scientific, setScientific] = useState(false);
  const [angle, setAngle] = useState("deg");
  const [history, setHistory] = useState(loadHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pressed, setPressed] = useState(null);
  const [toast, setToast] = useState("");
  const deviceRef = useRef(null);

  const allKeys = useMemo(() => (scientific ? [...BASIC_KEYS, ...SCI_KEYS] : BASIC_KEYS), [scientific]);

  const press = useCallback(
    (key) => {
      const action = key.action.type === "unary" ? { ...key.action, angle } : key.action;
      const next = reducer(state, action);
      dispatch(action);
      if (next.lastResult && next.lastResult !== state.lastResult) {
        setHistory((h) => {
          const list = [{ ...next.lastResult, at: Date.now() }, ...h].slice(0, 30);
          saveHistory(list);
          return list;
        });
      }
      setPressed(key.id);
      window.setTimeout(() => setPressed((p) => (p === key.id ? null : p)), 140);

      const el = document.querySelector(`[data-key="${key.id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        pulse(r.left + r.width / 2, r.top + r.height / 2, key.kind === "equals" ? 2.4 : 0.8);
      }
    },
    [angle, state],
  );

  // Clavier physique
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      const key = allKeys.find((k) => k.keys.includes(e.key));
      if (!key) return;
      e.preventDefault();
      press(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allKeys, press]);

  // Inclinaison 3D + reflet qui suivent le curseur
  useEffect(() => {
    const el = deviceRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const nx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
        const ny = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
        el.style.setProperty("--ry", `${nx * 6}deg`);
        el.style.setProperty("--rx", `${-ny * 6}deg`);
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1600);
  };

  const copyResult = async () => {
    if (state.error) return;
    try {
      await navigator.clipboard.writeText(state.current);
      showToast("Résultat copié");
    } catch {
      showToast("Copie impossible");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const shown = state.error ?? format(state.current);
  const resultKey = state.lastResult ? state.lastResult.expression + state.lastResult.result : "idle";

  return (
    <>
      <Background />

      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">∑</span>
          <span className="brand__name">Calculatrice</span>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => setHistoryOpen((o) => !o)}
          aria-expanded={historyOpen}
          aria-controls="history"
        >
          Historique{history.length > 0 && <span className="badge">{history.length}</span>}
        </button>
      </header>

      <main className="stage">
        <section className="intro">
          <p className="eyebrow">Calcul · Précision · Élégance</p>
          <h1>
            Les nombres, <em>autrement.</em>
          </h1>
          <p className="lede">
            Une calculatrice classique et scientifique, pilotable au clavier, qui réagit à chacun de vos gestes.
          </p>
          <ul className="hints" aria-label="Raccourcis clavier">
            <li><kbd>0–9</kbd> saisie</li>
            <li><kbd>+ − * /</kbd> opérations</li>
            <li><kbd>Entrée</kbd> résultat</li>
            <li><kbd>Échap</kbd> tout effacer</li>
          </ul>
        </section>

        <div className={`device ${scientific ? "device--sci" : ""}`} ref={deviceRef}>
          <div className="device__glare" aria-hidden="true" />

          <div className="device__top">
            <div className="segmented" role="tablist" aria-label="Mode de calcul">
              <span className="segmented__thumb" aria-hidden="true" />
              <button
                type="button"
                role="tab"
                aria-selected={!scientific}
                className={!scientific ? "is-active" : ""}
                onClick={() => setScientific(false)}
              >
                Classique
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={scientific}
                className={scientific ? "is-active" : ""}
                onClick={() => setScientific(true)}
              >
                Scientifique
              </button>
            </div>
            {scientific && (
              <button
                type="button"
                className="angle-btn"
                onClick={() => setAngle((a) => (a === "deg" ? "rad" : "deg"))}
                aria-label={`Unité d'angle : ${angle === "deg" ? "degrés" : "radians"}`}
              >
                {angle === "deg" ? "DEG" : "RAD"}
              </button>
            )}
          </div>

          <button type="button" className="display" onClick={copyResult} title="Cliquer pour copier">
            <span className="display__expr">
              <bdi>{state.expression || "\u00a0"}</bdi>
            </span>
            <span
              key={resultKey}
              className={`display__value ${sizeClass(shown)} ${state.lastResult && state.overwrite && !state.operator ? "is-result" : ""} ${state.error ? "is-error" : ""}`}
              aria-live="polite"
            >
              {shown}
            </span>
          </button>

          <div className="pads">
            {scientific && (
              <div className="pad pad--sci">
                {SCI_KEYS.map((k) => (
                  <Key key={k.id} k={k} pressed={pressed === k.id} onPress={press} />
                ))}
              </div>
            )}
            <div className="pad pad--basic">
              {BASIC_KEYS.map((k) => (
                <Key
                  key={k.id}
                  k={k}
                  pressed={pressed === k.id}
                  active={k.kind === "op" && state.operator === k.action.operator && state.overwrite}
                  onPress={press}
                 
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <aside id="history" className={`history ${historyOpen ? "is-open" : ""}`} aria-label="Historique des calculs">
        <div className="history__head">
          <h2>Historique</h2>
          <button type="button" className="ghost-btn ghost-btn--sm" onClick={() => setHistoryOpen(false)}>
            Fermer
          </button>
        </div>
        {history.length === 0 ? (
          <p className="history__empty">Vos calculs apparaîtront ici.</p>
        ) : (
          <>
            <ol className="history__list">
              {history.map((item) => (
                <li key={item.at}>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: "load", raw: item.result });
                      setHistoryOpen(false);
                    }}
                  >
                    <span className="history__expr">{item.expression}</span>
                    <span className="history__result">{format(item.result)}</span>
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="ghost-btn ghost-btn--sm history__clear" onClick={clearHistory}>
              Effacer l'historique
            </button>
          </>
        )}
      </aside>
      {historyOpen && <div className="scrim" onClick={() => setHistoryOpen(false)} aria-hidden="true" />}

      <div className={`toast ${toast ? "is-visible" : ""}`} role="status">
        {toast}
      </div>

      <footer className="footer">
        <span>
          © {new Date().getFullYear()} Dimitri Aigle
        </span>
      </footer>
    </>
  );
}

function Key({ k, pressed, active, onPress }) {
  return (
    <button
      type="button"
      data-key={k.id}
      className={`key key--${k.kind} ${pressed ? "is-pressed" : ""} ${active ? "is-active" : ""}`}
      aria-label={k.aria}
      onClick={() => onPress(k)}
    >
      <span>{k.label}</span>
    </button>
  );
}

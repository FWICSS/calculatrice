// Moteur de calcul pur : aucune dépendance à React, facile à tester.

export const MAX_DIGITS = 16;

export const initialState = {
  current: "0", // saisie en cours (chaîne brute, point décimal)
  previous: null, // opérande gauche (nombre)
  operator: null, // "+", "−", "×", "÷", "^"
  overwrite: true, // la prochaine saisie remplace `current`
  expression: "", // ligne secondaire affichée au-dessus du résultat
  error: null,
};

const BINARY = {
  "+": (a, b) => a + b,
  "−": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => (b === 0 ? NaN : a / b),
  "^": (a, b) => Math.pow(a, b),
};

// Arrondi à 12 chiffres significatifs pour éviter 0.1 + 0.2 = 0.30000000000000004
export const clean = (n) => {
  if (!Number.isFinite(n)) return n;
  const r = Number.parseFloat(n.toPrecision(12));
  return Object.is(r, -0) ? 0 : r;
};

const toRaw = (n) => {
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e16 || abs < 1e-9)) return n.toExponential(8).replace(/\.?0+e/, "e");
  return String(n);
};

const factorial = (n) => {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

const UNARY = {
  sin: { label: (x) => `sin(${x})`, fn: (x, rad) => Math.sin(rad(x)) },
  cos: { label: (x) => `cos(${x})`, fn: (x, rad) => Math.cos(rad(x)) },
  tan: {
    label: (x) => `tan(${x})`,
    fn: (x, rad) => (Math.abs(Math.cos(rad(x))) < 1e-12 ? NaN : Math.tan(rad(x))),
  },
  sqrt: { label: (x) => `√(${x})`, fn: (x) => (x < 0 ? NaN : Math.sqrt(x)) },
  sq: { label: (x) => `(${x})²`, fn: (x) => x * x },
  cube: { label: (x) => `(${x})³`, fn: (x) => x * x * x },
  exp: { label: (x) => `e^(${x})`, fn: (x) => Math.exp(x) },
  pow10: { label: (x) => `10^(${x})`, fn: (x) => Math.pow(10, x) },
  inv: { label: (x) => `1/(${x})`, fn: (x) => (x === 0 ? NaN : 1 / x) },
  ln: { label: (x) => `ln(${x})`, fn: (x) => (x <= 0 ? NaN : Math.log(x)) },
  log: { label: (x) => `log(${x})`, fn: (x) => (x <= 0 ? NaN : Math.log10(x)) },
  fact: { label: (x) => `${x}!`, fn: (x) => factorial(x) },
};

const CONSTANTS = { pi: Math.PI, e: Math.E };

const fail = (expression) => ({ ...initialState, expression, error: "Erreur" });

export function format(raw) {
  if (raw === null || raw === undefined) return "";
  const str = String(raw);
  if (str.includes("e")) return str.replace(".", ",");
  const [int, dec] = str.split(".");
  const sign = int.startsWith("-") ? "−" : "";
  const digits = int.replace("-", "");
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + grouped + (dec !== undefined ? "," + dec : "");
}

const value = (s) => Number.parseFloat(s.current);

export function reducer(state, action) {
  if (state.error && !["clear", "digit", "dot", "constant"].includes(action.type)) {
    return state;
  }
  const base = state.error ? initialState : state;

  switch (action.type) {
    case "digit": {
      if (base.overwrite) {
        return {
          ...base,
          current: action.digit,
          overwrite: false,
          expression: base.operator ? base.expression : "",
        };
      }
      if (base.current.replace(/[-.]/g, "").length >= MAX_DIGITS) return base;
      const current = base.current === "0" ? action.digit : base.current + action.digit;
      return { ...base, current };
    }

    case "dot": {
      if (base.overwrite) {
        return {
          ...base,
          current: "0.",
          overwrite: false,
          expression: base.operator ? base.expression : "",
        };
      }
      if (base.current.includes(".") || base.current.includes("e")) return base;
      return { ...base, current: base.current + "." };
    }

    case "backspace": {
      if (base.overwrite) return base;
      const current = base.current.length <= 1 || /^-\d$/.test(base.current) ? "0" : base.current.slice(0, -1);
      return { ...base, current };
    }

    case "clear":
      return initialState;

    case "negate": {
      if (base.current === "0") return base;
      const current = base.current.startsWith("-") ? base.current.slice(1) : "-" + base.current;
      return { ...base, current };
    }

    case "percent": {
      // 200 + 10 % → 200 + 20 ; seul : 10 % → 0,1
      const x = value(base);
      const useBase = base.previous !== null && (base.operator === "+" || base.operator === "−");
      const r = clean(useBase ? (base.previous * x) / 100 : x / 100);
      return { ...base, current: toRaw(r), overwrite: true };
    }

    case "constant":
      return {
        ...base,
        current: toRaw(clean(CONSTANTS[action.name])),
        overwrite: true,
        expression: base.operator ? base.expression : "",
      };

    case "unary": {
      const def = UNARY[action.fn];
      const x = value(base);
      const rad = (v) => (action.angle === "deg" ? (v * Math.PI) / 180 : v);
      const r = clean(def.fn(x, rad));
      const label = def.label(format(base.current));
      const expression = base.operator ? `${base.expression} ${label}` : label;
      if (!Number.isFinite(r)) return fail(expression);
      return { ...base, current: toRaw(r), overwrite: true, expression };
    }

    case "operator": {
      // Changement d'opérateur sans nouvelle saisie
      if (base.operator && base.overwrite) {
        return {
          ...base,
          operator: action.operator,
          expression: `${format(toRaw(base.previous))} ${action.operator}`,
        };
      }
      let left = value(base);
      if (base.operator && base.previous !== null) {
        left = clean(BINARY[base.operator](base.previous, left));
        if (!Number.isFinite(left)) return fail(`${base.expression} ${format(base.current)}`);
      }
      return {
        ...base,
        previous: left,
        operator: action.operator,
        current: toRaw(left),
        overwrite: true,
        expression: `${format(toRaw(left))} ${action.operator}`,
      };
    }

    case "equals": {
      if (!base.operator || base.previous === null) return base;
      const right = value(base);
      const r = clean(BINARY[base.operator](base.previous, right));
      const expression = `${format(toRaw(base.previous))} ${base.operator} ${format(base.current)} =`;
      if (!Number.isFinite(r)) return fail(expression);
      return {
        ...initialState,
        current: toRaw(r),
        expression,
        lastResult: { expression, result: toRaw(r) },
      };
    }

    case "load":
      return { ...initialState, current: action.raw };

    default:
      return base;
  }
}

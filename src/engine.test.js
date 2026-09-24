import { describe, expect, it } from "vitest";
import { format, initialState, reducer } from "./engine";

const run = (...actions) => actions.reduce(reducer, initialState);
const digits = (s) => [...s].map((c) => (c === "." ? { type: "dot" } : { type: "digit", digit: c }));
const op = (operator) => ({ type: "operator", operator });
const eq = { type: "equals" };

describe("moteur de calcul", () => {
  it("additionne et évite les erreurs de flottants", () => {
    expect(run(...digits("0.1"), op("+"), ...digits("0.2"), eq).current).toBe("0.3");
  });

  it("enchaîne les opérations de gauche à droite", () => {
    expect(run(...digits("2"), op("+"), ...digits("3"), op("×"), ...digits("4"), eq).current).toBe("20");
  });

  it("multiplie correctement", () => {
    expect(run(...digits("12"), op("×"), ...digits("12"), eq).current).toBe("144");
  });

  it("signale la division par zéro", () => {
    expect(run(...digits("5"), op("÷"), ...digits("0"), eq).error).toBe("Erreur");
  });

  it("gère le changement de signe et le retour arrière", () => {
    expect(run(...digits("42"), { type: "negate" }).current).toBe("-42");
    expect(run(...digits("42"), { type: "backspace" }).current).toBe("4");
  });

  it("calcule un pourcentage relatif", () => {
    expect(run(...digits("200"), op("+"), ...digits("10"), { type: "percent" }, eq).current).toBe("220");
  });

  it("applique les fonctions scientifiques en degrés et radians", () => {
    expect(run(...digits("30"), { type: "unary", fn: "sin", angle: "deg" }).current).toBe("0.5");
    expect(run(...digits("0"), { type: "unary", fn: "cos", angle: "rad" }).current).toBe("1");
    expect(run(...digits("81"), { type: "unary", fn: "sqrt" }).current).toBe("9");
    expect(run(...digits("5"), { type: "unary", fn: "fact" }).current).toBe("120");
    expect(run(...digits("2"), op("^"), ...digits("10"), eq).current).toBe("1024");
  });

  it("refuse la racine d'un nombre négatif", () => {
    expect(run(...digits("4"), { type: "negate" }, { type: "unary", fn: "sqrt" }).error).toBe("Erreur");
  });

  it("formate à la française", () => {
    expect(format("1234567.89")).toBe("1 234 567,89");
    expect(format("-1000")).toBe("−1 000");
  });
});

// Émet une onde de particules dans l'arrière-plan à la position (x, y).
export function pulse(x, y, strength = 1) {
  window.dispatchEvent(new CustomEvent("calc:pulse", { detail: { x, y, strength } }));
}

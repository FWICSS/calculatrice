# Calculatrice

Calculatrice classique et scientifique dans une interface immersive :
fond animé de particules qui réagit au curseur et à chaque touche, panneau en verre
incliné en 3D, historique des calculs et pilotage complet au clavier.

Projet d'école (juin 2022), modernisé en 2026. Déployé sur
[calculatrice.dimitriaigle.fr](https://calculatrice.dimitriaigle.fr).

## Fonctionnalités

- Mode **Classique** et mode **Scientifique** (sin, cos, tan en degrés ou radians, ln, log,
  √x, x², x³, xʸ, 1/x, eˣ, 10ˣ, π, e, n!)
- Enchaînement des opérations, pourcentage relatif (`200 + 10 %` → `220`), changement de signe,
  retour arrière
- Résultats arrondis proprement (`0,1 + 0,2 = 0,3`) et affichés au format français
- Historique conservé dans le navigateur, un clic recharge un résultat
- Clic sur l'écran pour copier le résultat
- Respect de `prefers-reduced-motion`

### Raccourcis clavier

| Touche | Action |
| --- | --- |
| `0`–`9`, `.` ou `,` | Saisie |
| `+` `-` `*` `/` `^` | Opérations |
| `Entrée` ou `=` | Résultat |
| `Retour arrière` | Effacer le dernier chiffre |
| `Échap` | Tout effacer |
| `%` | Pourcentage |
| `s` `c` `t` `l` `r` `p` `e` `!` | sin, cos, tan, ln, √, π, e, n! (mode scientifique) |

## Stack

React 19 · Vite 8 · Vitest · ESLint 10 (Node ≥ 20.19)

## Installation

```bash
git clone https://github.com/fwicss/calculatrice.git
cd calculatrice
npm install
npm run dev      # serveur de développement
npm test         # tests du moteur de calcul
npm run lint     # vérification du code
npm run build    # build de production dans build/
```

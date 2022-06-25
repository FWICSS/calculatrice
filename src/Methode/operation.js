import {setCalc,calc} from "./init_calcul";
import {format} from "./format";
import {supEspace} from "./supEspace";
import {calcul} from "./calcul";

export const operation = (e) => {
    setCalc({
        ...calc,
        operateur: e.target.innerHTML,
        resultat: !calc.numero
            ? calc.resultat
            : !calc.resultat
                ? calc.numero
                : format(calcul(Number(supEspace(calc.resultat)), Number(supEspace(calc.numero)), calc.sign)
                ),
        numero: 0,
    });
};
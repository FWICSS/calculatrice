import {setCalc,calc} from "./init_calcul";
import {format} from "./format";
import {supEspace} from "./supEspace";

export const inverse = () => {
    setCalc({
        ...calc,
        numero: calc.numero ? format(supEspace(calc.numero) * -1) : 0,
        resultat: calc.resultat ? format(supEspace(calc.resultat) * -1) : 0,
        operateur: "",
    });
};
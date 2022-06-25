import {calc, setCalc} from "./init_calcul";
import {supEspace} from "./supEspace";

export const pourcentage = () => {
    let numero = calc.numero ? parseFloat(supEspace(calc.numero)) : 0;
    let resultat = calc.resultat ? parseFloat(supEspace(calc.resultat)) : 0;
    setCalc({
        ...calc,
        numero: (numero /= Math.pow(100, 1)),
        resultat: (resultat /= Math.pow(100, 1)),
        operateur: "",
    });
};
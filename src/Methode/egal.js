import {calc, setCalc} from "./init_calcul";
import {format} from "./format";
import {calcul} from "./calcul";
import {supEspace} from "./supEspace";

export const egal = () => {
    if (calc.operateur && calc.numero) {
        setCalc({
            ...calc,
            resultat:
                calc.numero === "0" && calc.operateur === "/"
                    ? "division impossible par 0"
                    : format(
                        calcul(Number(supEspace(calc.resultat)),
                            Number(supEspace(calc.numero)),
                            calc.operateur)),
            operateur: "",
            numero: 0,
        });
    }
};
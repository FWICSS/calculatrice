import {setCalc,calc} from "./init_calcul";
import {format} from "./format";
import {supEspace} from "./supEspace";


export const clique = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    if (supEspace(calc.numero).length < 16) {
        setCalc({
            ...calc,
            numero:
                supEspace(calc.numero) % 1 === 0 && !calc.numero.toString().includes(".")
                    ? format(Number(supEspace(calc.numero + value)))
                    : format(calc.numero + value),
            resultat: !calc.operateur ? 0 : calc.resultat,
        });
    }
};
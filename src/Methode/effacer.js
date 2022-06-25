import {calc,setCalc} from "./init_calcul";

export const effacer = () => {
    setCalc({
        ...calc,
        operateur: "",
        numero: 0,
        resultat: 0,
    });
};
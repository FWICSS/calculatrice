import {setCalc,calc} from "./init_calcul";
export const point = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;

    setCalc({
        ...calc,
        numero: !calc.numero.toString().includes(".") ? calc.numero + value : calc.numero,
    });
};
import Calculette from "./elements/Calculette";
import Touch from "./elements/ButtonBox";
import Affichage from "./elements/Affichage";
import Button from "./elements/Button";
import React, {useState} from "react";



const btnValues = [
    ["C", "Sci", "%", "/"],
    [7, 8, 9, "X"],
    [4, 5, 6, "-"],
    [1, 2, 3, "+"],
    ["+/-",0, ".", "="],
];
const format = (numero) =>
    String(numero).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1 ");

const supEspace = (numero) => numero.toString().replace(/\s/g, "");

const calcul = (a, b, signe) =>
    signe === "+" ? a + b : signe === "-" ? a - b : signe === "*" ? a * b : a/b ;


const Calculatrice = ({modeSci}) => {

    let [calc, setCalc] = useState({
        operateur: "",
        numero: 0,
        resultat: 0,
    });
    const effacer = () => {
        setCalc({
            ...calc,
            operateur: "",
            numero: 0,
            resultat: 0,
        });
    };
    const inverse = () => {
        setCalc({
            ...calc,
            numero: calc.numero ? format(supEspace(calc.numero) * -1) : 0,
            resultat: calc.resultat ? format(supEspace(calc.resultat) * -1) : 0,
            operateur: "",
        });
    };
    const pourcentage = () => {
        let numero = calc.numero ? parseFloat(supEspace(calc.numero)) : 0;
        let resultat = calc.resultat ? parseFloat(supEspace(calc.resultat)) : 0;
        setCalc({
            ...calc,
            numero: (numero /= Math.pow(100, 1)),
            resultat: (resultat /= Math.pow(100, 1)),
            operateur: "",
        });
    };
    const egal = () => {
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
    const operation = (e) => {
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
    const point = (e) => {
        e.preventDefault();
        const value = e.target.innerHTML;

        setCalc({
            ...calc,
            numero: !calc.numero.toString().includes(".") ? calc.numero + value : calc.numero,
        });
    };
    const clique = (e) => {
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

    return (
        <Calculette>
            <Affichage value={calc.numero ? calc.numero : calc.resultat} />
            <Touch>
                {
                    btnValues.flat().map((btn, i) => {
                        return (
                            <Button
                                key={i}
                                className={btn === "=" ? "equals" : "" || btn === "C" ? "supp" : ""}
                                value={btn}
                                onClick={
                                    btn === "C"
                                        ? effacer
                                        : btn === "+-"
                                            ? inverse
                                            : btn === "%"
                                                ? pourcentage
                                                : btn === "="
                                                    ? egal
                                                    : btn === "/" || btn === "X" || btn === "-" || btn === "+"
                                                        ? operation
                                                        : btn === "."
                                                            ? point
                                                            : btn ==="Sci"
                                                                ? modeSci

                                                                : clique


                                }
                            />
                        );
                    })
                }
            </Touch>
        </Calculette>

    );
};

export default Calculatrice;
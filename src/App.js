import Calculette from "./elements/Calculette";
import Touch from "./elements/ButtonBox";
import Affichage from "./elements/Affichage";
import Button from "./elements/Button";

const btnValues = [
    ["C", "Sci", "%", "÷"],
    [7, 8, 9, "X"],
    [4, 5, 6, "-"],
    [1, 2, 3, "+"],
    ["+/-",0, ".", "="],
];

const App = () => {
    return (
        <Calculette>
            <Affichage value="0" />
            <Touch>
                {
                    btnValues.flat().map((btn, i) => {
                        return (
                            <Button
                                key={i}
                                className={btn === "=" ? "equals" : "" || btn === "C" ? "supp" : ""}

                                value={btn}
                                onClick={() => {
                                    console.log(`${btn} clicked!`);
                                }}
                            />
                        );
                    })
                }
            </Touch>
        </Calculette>
    );
};

export default App;

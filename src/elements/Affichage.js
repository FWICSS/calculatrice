import { Textfit } from "react-textfit";
import "./Affichage.css";

const Affichage = ({ value }) => {
    return (
        <Textfit className="ecran" mode="single" max={70}>
            {value}
        </Textfit>
    );
};

export default Affichage;
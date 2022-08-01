import "../elements_s/Button_s.css";

const Button_s = ({ className, value, onClick }) => {
    return (
        <button className={className} onClick={onClick}>
            {value}
        </button>
    );
};

export default Button_s;
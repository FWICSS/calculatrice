import Wrapper from "./elements/Calculette";
import Screen from "./elements/Affichage";
import Button from "./elements/Touch";
import ButtonBox from "./elements/Button";

const App = () => {
  return (
      <Wrapper>
        <Screen value="0" />
        <ButtonBox>
          <Button
              className=""
              value="0"
              onClick={() => {
                console.log("Button clicked!");
              }}
          />
        </ButtonBox>
      </Wrapper>
  );
};

export default App;

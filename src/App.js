import React, {Component} from 'react';
import Calculatrice from "./Calculatrice";
import Calculatricesci from "./Calculatricesci";

class App extends Component{
   state = {
            mode : false
        };

    modeCalcul(valeur) {
        (this.state.mode: valeur);
    };

    changeMode = () => {

        console.log(123);
        if (this.state.mode === false){
            console.log("mode calculette")
            const newMode = true;

            this.setState({
                mode: newMode
            })
        }
        else {
            console.log("mode calculatrice")
            const newMode = false;

            this.setState({
                mode: newMode
            })
        }
    }


    render()
    {
        return (
            <div>
                {this.state.mode === false && <Calculatrice  modeSci={this.changeMode}/>}
                {this.state.mode === true && <Calculatricesci modeCalcula={this.changeMode}/>}


            </div>
        );
    }
};

export default App;

import React, {Component} from 'react';
import Calculatrice from "./Calculatrice";
import Calculatrice_s from "./Calculatrice_s";

class App extends Component{
    constructor() {
        super();

        this.state = {
            mode : false
        };
    }
    modeCalcul(valeur) {
        this.setState({ mode:valeur});
    };


    render()
    {
        return (
            <div>
                {this.state.mode === false && <Calculatrice  modeSci={this.modeCalcul}/>}
                {this.state.mode === true && <Calculatrice_s modeCalcul={this.modeCalcul}/>}


            </div>
        );
    }
};

export default App;

import React, {Component} from 'react';
import Calculatrice from "./Calculatrice";
import Calculatrice_s from "./Calculatrice_s";

class App extends Component{
    constructor(props) {
        super(props);

        this.state = {
            mode :false
        };
    }
    render()
    {
        return (
            <div>

                {this.state.mode === false && <Calculatrice_s/>}

            </div>
        );
    }
};

export default App;

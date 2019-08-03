import React, { Component, Fragment } from 'react';
import Crossword from './crossword';
import words from '../../../data/words';

class App extends Component {
    static displayName = 'App';

    shouldComponentUpdate = () => false;

    render() {
        return (
            <Fragment>
                <h1>Crossword</h1>
                <Crossword words={words} />
            </Fragment>
        );
    }
}

export default App;

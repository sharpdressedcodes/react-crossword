import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Crossword from './crossword';
import { appLoaded } from '../actions/app';

class App extends Component {
    static displayName = 'App';

    static propTypes = {
        validatedWords: PropTypes.arrayOf(PropTypes.object)
    };

    static defaultProps = {
        validatedWords: []
    };

    static contextTypes = {
        config: PropTypes.object.isRequired,
        executeAction: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);

        const { config } = context;
        this.maxGridWidth = get(config, 'app.maxGridWidth', 15);
        this.maxGridHeight = get(config, 'app.maxGridHeight', 15);
        this.maxWords = get(config, 'app.maxWords', 10);
        this.words = get(config, 'app.words', []);

        context.executeAction(appLoaded, {
            maxGridWidth: this.maxGridWidth,
            maxGridHeight: this.maxGridHeight,
            maxWords: this.maxWords,
            words: this.words
        });
    }

    /**
     * Parse the incoming words. More can be done here, like calculating the end position based on the length of the answer.
     * @param words
     * @returns parsed words
     */
    static parseWords(words) {
        const positions = [];
        words = words.map(word => {
            word.horizontal = word.startX !== word.endX;

            // Loop through words, keeping track the position of each unique cell
            // This gets used as the indicator.

            if (word.horizontal) {
                for (let x = word.startX; x <= word.endX; x++) {
                    const position = { x, y: word.startY };
                    const exists = typeof positions.find(pos => pos.x === position.x && pos.y === position.y) !== 'undefined';

                    if (x === word.startX && !exists) {
                        positions.push(position);
                    }
                }
            } else {
                for (let y = word.startY; y <= word.endY; y++) {
                    const position = { x: word.startX, y };
                    const exists = typeof positions.find(pos => pos.x === position.x && pos.y === position.y) !== 'undefined';

                    if (y === word.startY && !exists) {
                        positions.push(position);
                    }
                }
            }

            word.indicator = positions.length;
            word.rendered = false;

            return word;
        });
        return words;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.validatedWords !== this.props.validatedWords && nextProps.validatedWords.length > 0) {
            nextProps.validatedWords.forEach(word => {
                const { index, indicator, correct, answer } = word;
                // eslint-disable-next-line
                console.log(`Word ${index} (${indicator}): ${correct ? `correct! ${answer}` : 'incorrect :('}`);
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const validatedWordsChanged = nextProps.validatedWords !== this.props.validatedWords;
        return validatedWordsChanged;
    }

    render() {
        return (
            <Fragment>
                <h1>Crossword</h1>
                <Crossword
                    words={App.parseWords(this.words.slice(0, this.maxWords))}
                    maxGridWidth={this.maxGridWidth}
                    maxGridHeight={this.maxGridHeight}
                />
            </Fragment>
        );
    }
}

export default App;

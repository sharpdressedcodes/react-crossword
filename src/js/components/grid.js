import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import Row from './row';
import Cell from './cell';
import { addInputCell } from '../actions/grid';

class Grid extends Component {
    static displayName = 'Grid';

    static propTypes = {
        words: PropTypes.arrayOf(PropTypes.shape({
            word: PropTypes.string.isRequired,
            startX: PropTypes.number.isRequired,
            startY: PropTypes.number.isRequired,
            endX: PropTypes.number.isRequired,
            endY: PropTypes.number.isRequired,
        })).isRequired,
        maxWidth: PropTypes.number.isRequired,
        maxHeight: PropTypes.number.isRequired,
        currentPosition: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }),
        validate: PropTypes.bool,
        typedLetters: PropTypes.arrayOf(PropTypes.shape({
            position: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            }).isRequired,
            letter: PropTypes.string.isRequired,
            indicator: PropTypes.number.isRequired
        }))
    };

    static defaultProps = {
        currentPosition: null,
        validate: false,
        typedLetters: []
    };

    static contextTypes = {
        executeAction: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            rows: []
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const wordsChanged = nextProps.words !== this.props.words;
        const rowsChanged = nextState.rows !== this.state.rows;
        const currentPositionChanged = nextProps.currentPosition !== this.props.currentPosition;
        const validateChanged = nextProps.validate !== this.props.validate;
        //const getTypedWordFromPositionChanged = nextProps.getTypedWordFromPosition !== this.props.getTypedWordFromPosition;

        //console.log('Grid::shouldComponentUpdate::currentPositionChanged', currentPositionChanged);

        return wordsChanged || rowsChanged || currentPositionChanged || validateChanged;// || getTypedWordFromPositionChanged;
    }

    componentWillReceiveProps(nextProps) {

        if (!this.props.validate && nextProps.validate !== this.props.validate) {
            this.validateWords();
        }
    }

    static getLetterFromPosition = (x, y, words, wordCount) => {
        let result = {
            index: null,
            letter: null,
            wordIndex: null
        };
        let index = null;

        for (let i = 0; i < wordCount; i++) {
            const word = words[i];

            if (!word.rendered) {
                const horizontal = word.startX !== word.endX;

                switch (horizontal) {
                    case true:
                        if (word.startY === y && x > word.startX - 1 && x < word.endX + 1) {
                            index = x - word.startX;
                            result = {
                                index,
                                letter: word.word.substr(index, 1),
                                wordIndex: i// + 1
                            };
                            //result = word.word.substr(x - word.startX, 1);
                            if (x === word.endX) {
                                word.rendered = true;
                            }
                        }
                        break;

                    default:
                        if (word.startX === x && y > word.startY - 1 && y < word.endY + 1) {
                            index = y - word.startY;
                            result = {
                                index,
                                letter: word.word.substr(index, 1),
                                wordIndex: i// + 1
                            };
                            //result = word.word.substr(y - word.startY, 1);
                            if (y === word.endY) {
                                word.rendered = true;
                            }
                        }
                }
            }
        }


        return result;
    };

    findTypedLetterByPosition(position) {
        const { typedLetters } = this.props;

        let result = null;

        typedLetters.every(typedLetter => {
            if (typedLetter.position.x === position.x && typedLetter.position.y === position.y) {
                result = typedLetter;
            }
            return result === null;
        });

        return result;
    }

    validateWords() {

        this.props.words.forEach((word, index) => {

            const horizontal = word.startX !== word.endX;
            let correct = true;
            let firstLetter = null;

            if (horizontal) {

                for (let i = word.startX, letterIndex = 0; i <= word.endX; i++, letterIndex++) {
                    const letter = word.word.substr(letterIndex, 1);
                    const position = { x: i, y: word.startY };
                    const typedLetter = this.findTypedLetterByPosition(position);

                    if (!firstLetter) {
                        firstLetter = typedLetter;
                    }

                    if (letter !== typedLetter.letter) {
                        correct = false;
                        break;
                    }
                }

            } else {

                for (let i = word.startY, letterIndex = 0; i <= word.endY; i++, letterIndex++) {
                    const letter = word.word.substr(letterIndex, 1);
                    const position = { x: word.startX, y: i };
                    const typedLetter = this.findTypedLetterByPosition(position);

                    if (!firstLetter) {
                        firstLetter = typedLetter;
                    }

                    if (letter !== typedLetter.letter) {
                        correct = false;
                        break;
                    }
                }

            }

            const j = index + 1;
            console.log(`Word ${j} (${firstLetter.indicator}): ` + (correct ? `correct! ${word.word}` : 'incorrect :('));
        });
    }

    render() {
        const { words, maxWidth, maxHeight } = this.props;
        const { rows } = this.state;
        const wordCount = words.length;
        const positions = [];

        if (rows.length === 0) {
            for (let y = 0; y < maxHeight; y++) {
                const cells = [];

                for (let x = 0; x < maxWidth; x++) {
                    const { letter, index, wordIndex } = Grid.getLetterFromPosition(x, y, words, wordCount);

                    const position = {x, y};
                    const exists = positions.includes(position);

                    if (index === 0 && !exists) {
                        positions.push(position);
                    }

                    const cellKey = `cell-${x}`;

                    if (letter !== null) {
                        this.context.executeAction(addInputCell, {
                            position,
                            letter: '',
                            indicator: positions.length
                        });
                    }

                    cells.push(
                        <Cell
                            position={position}
                            letter={letter}
                            letterIndex={index}
                            indicator={positions.length}
                            key={cellKey}
                        />
                    );
                }
                const rowKey = `row-${y}`;
                rows.push(<Row cells={cells} key={rowKey} />);
            }
        }

        //console.log('Grid::render');

        return <div className="grid">{rows}</div>;
    }
}

const ConnectedGrid = connectToStores(Grid, ['AppStore'], context => {
    const appStore = context.getStore('AppStore');
    const currentPosition = appStore.getPosition();
    const validate = appStore.getValidate();
    const typedLetters = appStore.getTypedLetters();
    return {
        currentPosition,
        validate,
        typedLetters
    };
});

export default ConnectedGrid;

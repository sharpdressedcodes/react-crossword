import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import Row from './row';
import Cell from './cell';
import { addInputCell, guessNextInputCell } from '../actions/grid';
import { wordPropType, positionPropType, typedLetterPropType, DirectionTypes } from '../constants/grid';

class Grid extends Component {
    static displayName = 'Grid';

    static propTypes = {
        words: PropTypes.arrayOf(PropTypes.shape(wordPropType)).isRequired,
        maxWidth: PropTypes.number.isRequired,
        maxHeight: PropTypes.number.isRequired,
        currentPosition: PropTypes.shape(positionPropType),
        validate: PropTypes.bool,
        typedLetters: PropTypes.arrayOf(PropTypes.shape(typedLetterPropType)),
        lastTypedLetter: PropTypes.shape(typedLetterPropType)
    };

    static defaultProps = {
        currentPosition: null,
        validate: false,
        typedLetters: [],
        lastTypedLetter: null
    };

    static contextTypes = {
        executeAction: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            rows: [],
            direction: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const wordsChanged = nextProps.words !== this.props.words;
        const rowsChanged = nextState.rows !== this.state.rows;
        const currentPositionChanged = nextProps.currentPosition !== this.props.currentPosition;
        const validateChanged = nextProps.validate !== this.props.validate;
        const lastTypedLetterChanged = nextProps.lastTypedLetter !== this.props.lastTypedLetter;

        return wordsChanged || rowsChanged || currentPositionChanged || validateChanged || lastTypedLetterChanged;
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.validate && nextProps.validate !== this.props.validate) {
            this.validateWords();
        }

        if (nextProps.lastTypedLetter !== this.props.lastTypedLetter /* && nextProps.lastTypedLetter.letter !== null */) {
            // User just typed a valid letter, see if we can guess where the next letter is, and automatically focus on that
            const nextPosition = this.guessNextPosition(nextProps.lastTypedLetter.position);
            if (nextPosition) {
                this.context.executeAction(guessNextInputCell, { position: nextPosition });
            }
        }
    }

    guessNextPosition(position) {
        const { direction } = this.state;
        const typedLetter = this.findTypedLetterByPosition(position);
        let nextPosition = null;

        switch (direction) {
            case DirectionTypes.VERTICAL:
                // Check vertical first, if this fails, check horizontal
                nextPosition = this.checkNextVerticalPosition(typedLetter);
                if (!nextPosition) {
                    nextPosition = this.checkNextHorizontalPosition(typedLetter);
                }
                break;

            case DirectionTypes.HORIZONTAL:
            default:
                // No direction specified/check horizontal first, then check vertical
                nextPosition = this.checkNextHorizontalPosition(typedLetter);
                if (!nextPosition) {
                    nextPosition = this.checkNextVerticalPosition(typedLetter);
                }
        }

        return nextPosition;
    }

    checkNextHorizontalPosition(typedLetter) {
        let nextPosition = null;
        let nextValue = null;

        typedLetter.parentWords.every(word => {
            if (word.horizontal) {
                // Look for the next x
                nextValue = typedLetter.position.x + 1;
                // Are we at the end of the word or grid?
                if (nextValue <= word.endX && nextValue < this.props.maxWidth) {
                    nextPosition = { x: nextValue, y: typedLetter.position.y };
                    this.setState({ direction: DirectionTypes.HORIZONTAL });
                }
            }
            return nextPosition == null;
        });

        return nextPosition;
    }

    checkNextVerticalPosition(typedLetter) {
        let nextPosition = null;
        let nextValue = null;

        typedLetter.parentWords.every(word => {
            if (!word.horizontal) {
                // Look for the next y
                nextValue = typedLetter.position.y + 1;
                // Are we at the end of the word or grid?
                if (nextValue <= word.endY && nextValue < this.props.maxHeight) {
                    nextPosition = { x: typedLetter.position.x, y: nextValue };
                    this.setState({ direction: DirectionTypes.VERTICAL });
                }
            }
            return nextPosition == null;
        });

        return nextPosition;
    }

    static getLetterFromPosition = (x, y, words, wordCount) => {
        let result = {
            index: null,
            letter: null,
            wordIndex: null,
            parentWords: null
        };
        let index = null;

        for (let i = 0; i < wordCount && index === null; i++) {
            const word = words[i];

            if (!word.rendered) {
                switch (word.horizontal) {
                    case true:
                        if (word.startY === y && x > word.startX - 1 && x < word.endX + 1) {
                            index = x - word.startX;
                            result = {
                                index,
                                letter: word.answer.substr(index, 1),
                                wordIndex: i,
                                parentWords: [word]
                            };
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
                                letter: word.answer.substr(index, 1),
                                wordIndex: i,
                                parentWords: [word]
                            };
                            if (y === word.endY) {
                                word.rendered = true;
                            }
                        }
                }
            }
        }

        if (index !== null) {
            // Does this letter belong to more than 1 word?
            for (let i = 0; i < wordCount; i++) {
                const word = words[i];
                const letterIndex = Grid.getIndexFromPositionInWord({ x, y }, word);
                if (letterIndex > -1 && !result.parentWords.includes(word)) {
                    result.parentWords.push(word);
                }
            }
        }

        return result;
    };

    static getIndexFromPositionInWord(position, word) {
        let index = -1;

        switch (word.horizontal) {
            case true:
                if (word.startY === position.y) {
                    for (let x = word.startX; x <= word.endX; x++) {
                        if (x === position.x) {
                            index = x - word.startX;
                            break;
                        }
                    }
                }
                break;

            default:
                if (word.startX === position.x) {
                    for (let y = word.startY; y <= word.endY; y++) {
                        if (y === position.y) {
                            index = y - word.startY;
                            break;
                        }
                    }
                }
        }
        return index;
    }

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
            let correct = true;
            let firstLetter = null;

            if (word.horizontal) {
                for (let i = word.startX, letterIndex = 0; i <= word.endX; i++, letterIndex++) {
                    const letter = word.answer.substr(letterIndex, 1);
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
                    const letter = word.answer.substr(letterIndex, 1);
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
            // eslint-disable-next-line
            console.log(`Word ${j} (${firstLetter.indicator}): ${correct ? `correct! ${word.answer}` : 'incorrect :('}`);
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
                    const { letter, index, wordIndex, parentWords } = Grid.getLetterFromPosition(x, y, words, wordCount);

                    const position = { x, y };
                    const exists = positions.includes(position);

                    if (index === 0 && !exists) {
                        positions.push(position);
                    }

                    const cellKey = `cell-${x}`;

                    if (letter !== null) {
                        this.context.executeAction(addInputCell, {
                            position,
                            letter: '',
                            indicator: positions.length,
                            parentWords
                        });
                    }

                    cells.push(<Cell position={position} letter={letter} letterIndex={index} indicator={positions.length} key={cellKey} />);
                }
                const rowKey = `row-${y}`;
                rows.push(<Row cells={cells} key={rowKey} />);
            }
        }

        // console.log('Grid::render');

        return <div className="grid">{rows}</div>;
    }
}

const ConnectedGrid = connectToStores(Grid, ['AppStore'], context => {
    const appStore = context.getStore('AppStore');
    const currentPosition = appStore.getPosition();
    const validate = appStore.getValidate();
    const typedLetters = appStore.getTypedLetters();
    const lastTypedLetter = appStore.getLastTypedLetter();
    return {
        currentPosition,
        validate,
        typedLetters,
        lastTypedLetter
    };
});

export default ConnectedGrid;

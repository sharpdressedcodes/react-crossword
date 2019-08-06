import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Row from './row';
import Cell from './cell';
import { addInputCell } from '../actions/grid';
import { wordPropType } from '../constants/grid';

class Grid extends Component {
    static displayName = 'Grid';

    static propTypes = {
        words: PropTypes.arrayOf(PropTypes.shape(wordPropType)).isRequired,
        maxWidth: PropTypes.number.isRequired,
        maxHeight: PropTypes.number.isRequired
    };

    static contextTypes = {
        executeAction: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            rows: []
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const wordsChanged = nextProps.words !== this.props.words;
        const rowsChanged = nextState.rows !== this.state.rows;

        return wordsChanged || rowsChanged;
    }

    /**
     * Get letter information from a given position (x, y) on the grid.
     *
     * @param x The x position
     * @param y The y position
     * @param words The questions and answer data
     * @param wordCount Used to prevent useless array length counts inside loops
     * @returns {{index: null, letter: null, wordIndex: null, parentWords: null}}
     */
    static getLetterFromPosition(x, y, words, wordCount) {
        let result = {
            index: null,
            letter: null,
            wordIndex: null,
            parentWords: null
        };
        let index = null;

        for (let i = 0; i < wordCount && index === null; i++) {
            const word = words[i];

            // Only check words that haven't yet been checked.
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
    }

    /**
     * Get the letter position in the word from a given position on the grid.
     *
     * @param position An object containing x and y positions.
     * @param word The subject
     * @returns {number} The index of the letter or -1 if it fails
     */
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

    render() {
        const { words, maxWidth, maxHeight } = this.props;
        const { rows } = this.state;
        const wordCount = words.length;

        if (rows.length === 0) {

            // Render rows, vertically
            for (let y = 0; y < maxHeight; y++) {
                const cells = [];

                // Render cells, horizontally
                for (let x = 0; x < maxWidth; x++) {
                    const { letter, index, parentWords } = Grid.getLetterFromPosition(x, y, words, wordCount);
                    const position = { x, y };
                    const cellKey = `cell-${x}`;
                    let indicator = null;

                    if (letter !== null) {

                        // If this is the first letter, it's safe to use the first parentWord indicator
                        if (index === 0) {
                            indicator = parentWords[0].indicator;

                        } else if (parentWords.length > 1) {

                            // Not first letter, look for next parentWord's indicator
                            for (let i = 1, len = parentWords.length; i < len; i++) {
                                const newIndex = Grid.getIndexFromPositionInWord(position, parentWords[i]);
                                if (newIndex === 0) {
                                    indicator = parentWords[i].indicator;
                                    break;
                                }
                            }
                        }

                        this.context.executeAction(addInputCell, {
                            position,
                            letter: '',
                            indicator,
                            parentWords
                        });
                    }

                    cells.push(<Cell position={position} letter={letter} indicator={indicator} key={cellKey} />);
                }
                const rowKey = `row-${y}`;
                rows.push(<Row cells={cells} key={rowKey} />);
            }
        }

        // console.log('Grid::render');

        return <div className="crossword-grid">{rows}</div>;
    }
}

export default Grid;

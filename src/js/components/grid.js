import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Row from './row';
import Cell from './cell';
import { addInputCell } from '../actions/grid';
import { wordPropType } from '../constants/grid';
import { getLetterFromPosition, getIndexFromPositionInWord } from '../helpers/crossword';

class Grid extends Component {
    static displayName = 'Grid';

    static propTypes = {
        words: PropTypes.arrayOf(PropTypes.shape(wordPropType)).isRequired,
        maxWidth: PropTypes.number.isRequired,
        maxHeight: PropTypes.number.isRequired
    };

    static contextTypes = {
        executeAction: PropTypes.func
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
                    const { letter, index, parentWords } = getLetterFromPosition(x, y, words, wordCount);
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
                                const newIndex = getIndexFromPositionInWord(position, parentWords[i]);
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

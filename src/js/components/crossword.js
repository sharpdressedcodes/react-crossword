import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Grid from './grid';
import Question from './question';
import Button from './button';
import ToggleButton from './toggleButton';
import { toggleShowCorrectAnswer, validateCells } from '../actions/crossword';
import { wordPropType } from '../constants/crossword';

class Crossword extends Component {
    static displayName = 'Crossword';

    static MAX_WIDTH = 15; // cells

    static MAX_HEIGHT = 15; // cells

    static propTypes = {
        words: PropTypes.arrayOf(PropTypes.shape(wordPropType)).isRequired
    };

    static contextTypes = {
        executeAction: PropTypes.func.isRequired
    };

    shouldComponentUpdate(nextProps, nextState) {
        const wordsChanged = nextProps.words !== this.props.words;
        return wordsChanged;
    }

    onValidateClick = event => {
        this.context.executeAction(validateCells, { validate: true });
    };

    onShowAnswerClick = event => {
        this.context.executeAction(toggleShowCorrectAnswer, { toggle: true });
    };

    onHideAnswerClick = event => {
        this.context.executeAction(toggleShowCorrectAnswer, { toggle: false });
    };

    render() {
        // console.log('Crossword::render');
        const positions = [];
        const words = this.props.words.map(word => {
            word.horizontal = word.startX !== word.endX;

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
        const questions = words.map((word, index) => {
            const key = `question-${index}`;
            return <Question question={word.question} index={word.indicator} key={key} />;
        });

        return (
            <Fragment>
                <Grid words={words} maxWidth={Crossword.MAX_WIDTH} maxHeight={Crossword.MAX_HEIGHT} />
                <Button text="Validate" clickHandler={this.onValidateClick} />
                <ToggleButton
                    on={{
                        text: 'Show correct answer',
                        clickHandler: this.onShowAnswerClick
                    }}
                    off={{
                        text: 'Hide correct answer',
                        clickHandler: this.onHideAnswerClick
                    }}
                />
                {questions}
            </Fragment>
        );
    }
}

export default Crossword;

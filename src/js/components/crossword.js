import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from './grid';
import Question from './question';
import Button from './button';
import ToggleButton from './toggleButton';
import { toggleShowCorrectAnswer, validateCells } from '../actions/crossword';
import { wordPropType } from '../constants/crossword';

class Crossword extends Component {
    static displayName = 'Crossword';

    static propTypes = {
        words: PropTypes.arrayOf(PropTypes.shape(wordPropType)).isRequired,
        maxGridWidth: PropTypes.number.isRequired,
        maxGridHeight: PropTypes.number.isRequired
    };

    static contextTypes = {
        executeAction: PropTypes.func.isRequired
    };

    shouldComponentUpdate(nextProps, nextState) {
        const wordsChanged = nextProps.words !== this.props.words;
        return wordsChanged;
    }

    onValidateClick = event => {
        this.context.executeAction(validateCells, { validate: true, words: this.props.words });
    };

    onShowAnswerClick = event => {
        this.context.executeAction(toggleShowCorrectAnswer, { toggle: true });
    };

    onHideAnswerClick = event => {
        this.context.executeAction(toggleShowCorrectAnswer, { toggle: false });
    };

    render() {
        // console.log('Crossword::render');
        const { words, maxGridWidth, maxGridHeight } = this.props;
        const questions = words.map((word, index) => {
            const key = `question-${index}`;
            return <Question question={word.question} index={word.indicator} key={key} />;
        });

        return (
            <section className="crossword">
                <Grid words={words} maxWidth={maxGridWidth} maxHeight={maxGridHeight} />
                <Button text="Validate" clickHandler={this.onValidateClick} className="crossword-button" />
                <ToggleButton
                    on={{
                        text: 'Show correct answer',
                        clickHandler: this.onShowAnswerClick,
                        className: 'crossword-toggle-button'
                    }}
                    off={{
                        text: 'Hide correct answer',
                        clickHandler: this.onHideAnswerClick
                    }}
                />
                {questions}
            </section>
        );
    }
}

export default Crossword;

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Grid from './grid';
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
        return (
            <Fragment>
                <Grid
                    words={this.props.words.map(word => {
                        word.rendered = false;
                        word.horizontal = word.startX !== word.endX;
                        return word;
                    })}
                    maxWidth={Crossword.MAX_WIDTH}
                    maxHeight={Crossword.MAX_HEIGHT}
                />
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
            </Fragment>
        );
    }
}

export default Crossword;

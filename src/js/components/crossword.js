import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
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
        maxGridHeight: PropTypes.number.isRequired,
        currentWords: PropTypes.arrayOf(PropTypes.shape(wordPropType))
    };

    static contextTypes = {
        executeAction: PropTypes.func,
        getStore: PropTypes.func
    };

    static defaultProps = {
        currentWords: []
    };

    shouldComponentUpdate(nextProps, nextState) {
        const wordsChanged = nextProps.words !== this.props.words;
        const currentWordsChanged = nextProps.currentWords !== this.props.currentWords;
        return wordsChanged || currentWordsChanged;
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
        const { words, maxGridWidth, maxGridHeight, currentWords } = this.props;
        const questions = words.map((word, index) => {
            const key = `question-${index}`;
            const className = currentWords.length > 0 && currentWords.includes(word) ? 'active' : '';
            return <Question question={word.question} index={word.indicator} className={className} key={key} />;
        });

        return (
            <section className="crossword">
                <div className="crossword-container">
                    <Grid words={words} maxWidth={maxGridWidth} maxHeight={maxGridHeight} />
                    <div className="crossword-buttons">
                        <Button text="Validate" clickHandler={this.onValidateClick} className="crossword-button" />
                        <ToggleButton
                            on={{
                                text: 'Show correct answer',
                                clickHandler: this.onShowAnswerClick,
                                className: 'crossword-toggle-button'
                            }}
                            off={{
                                text: 'Hide correct answer',
                                clickHandler: this.onHideAnswerClick,
                                className: 'crossword-toggle-button'
                            }}
                        />
                    </div>
                </div>
                <div className="crossword-questions">{questions}</div>
            </section>
        );
    }
}

const ConnectedCrossword = connectToStores(Crossword, ['AppStore'], context => {
    const appStore = context.getStore('AppStore');
    const currentWords = appStore.getCurrentWords();
    return {
        currentWords
    };
});

export default ConnectedCrossword;
export const DisconnectedCrossword = Crossword;

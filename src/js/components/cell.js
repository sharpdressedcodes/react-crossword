import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import get from 'lodash/get';
import { cellClicked, cellTyped, cellNavigated } from '../actions/cell';
import { PhaseTypes } from '../constants/cell';
import { positionPropType } from '../constants/grid';

class Cell extends Component {
    static displayName = 'Cell';

    static LETTER_DEFAULT = '+'; // Used as a fallback

    static LETTER_ACTIVE = '-'; // Used as a fallback

    static RX_INPUT = /^[a-z+]$/i; // Used as a fallback

    static propTypes = {
        position: PropTypes.shape(positionPropType).isRequired,
        letter: PropTypes.string,
        indicator: PropTypes.number,
        toggleShowCorrectAnswer: PropTypes.bool,
        validate: PropTypes.bool,
        nextPosition: PropTypes.shape(positionPropType)
    };

    static defaultProps = {
        letter: null,
        indicator: null,
        toggleShowCorrectAnswer: false,
        validate: false,
        nextPosition: null
    };

    static contextTypes = {
        config: PropTypes.object,
        executeAction: PropTypes.func,
        getStore: PropTypes.func
    };

    constructor(props, context) {
        super(props, context);

        const { config } = context;

        this.letterDefault = get(config, 'app.cell.letterDefault', Cell.LETTER_DEFAULT);
        this.letterActive = get(config, 'app.cell.letterActive', Cell.LETTER_ACTIVE);
        this.regex = get(config, 'app.cell.regex', Cell.RX_INPUT);

        this.state = {
            phase: PhaseTypes.START,
            typedLetter: null
        };
        this.prevState = this.state;
    }

    onCellClick = event => {
        this.setState({ phase: PhaseTypes.INPUT });
        this.context.executeAction(cellClicked, { position: this.props.position });
    };

    onInput = event => {
        let { value } = event.target;
        const payload = {
            position: this.props.position,
            letter: null
        };

        // Give the user the ability to update their input
        if (value.length > 0) {
            value = value.substr(-1);
        }

        if (value && this.regex.test(value)) {
            payload.letter = value.toUpperCase();
        } else {
            this.input.value = '';
        }

        this.setState({ typedLetter: payload.letter });
        this.context.executeAction(cellTyped, payload);
    };

    /**
     * Let the user navigate to next/previous questions with arrow keys or tab or shift + tab or enter
     *
     * @param event
     */
    onKeyDown = event => {
        let desiredDirection = null;

        switch (event.keyCode) {
            case 9: // Tab
                desiredDirection = event.shiftKey ? 'prev' : 'next';
                break;
            case 13: // Enter
            case 39: // ArrowRight
            case 40: // ArrowDown
                desiredDirection = 'next';
                break;
            case 37: // ArrowLeft
            case 38: // ArrowUp
                desiredDirection = 'prev';
                break;
            default:
                return;
        }

        event.preventDefault();
        this.context.executeAction(cellNavigated, { ...this.props, desiredDirection });
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.toggleShowCorrectAnswer !== this.props.toggleShowCorrectAnswer) {
            if (nextProps.toggleShowCorrectAnswer) {
                this.prevState = this.state;
                this.setState({ phase: PhaseTypes.SHOW });
            } else {
                this.setState({ phase: this.prevState.phase });
            }
        }

        if (this.props.letter !== null && nextProps.validate !== this.props.validate) {
            if (nextProps.validate) {
                this.prevState = this.state;
                this.setState({ phase: PhaseTypes.VALIDATE });
            } else {
                this.setState({ phase: this.prevState.phase });
            }
        }

        if (
            nextProps.nextPosition &&
            nextProps.nextPosition !== this.props.nextPosition &&
            this.props.position.x === nextProps.nextPosition.x &&
            this.props.position.y === nextProps.nextPosition.y &&
            this.state.phase !== PhaseTypes.INPUT
        ) {
            this.setState({ phase: PhaseTypes.INPUT });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const phaseChanged = this.state.phase !== nextState.phase;
        const toggleShowCorrectAnswerChanged = this.props.letter !== null && this.props.toggleShowCorrectAnswer !== nextProps.toggleShowCorrectAnswer;
        const validateChanged = this.props.letter !== null && this.props.validate !== nextProps.validate;
        const typedLetterChanged = this.state.typedLetter !== nextState.typedLetter;

        return phaseChanged || toggleShowCorrectAnswerChanged || validateChanged || typedLetterChanged;
    }

    componentDidUpdate(prevProps) {
        if (this.state.phase === PhaseTypes.INPUT) {
            this.input.addEventListener('keydown', this.onKeyDown, false);
            this.input.focus();
        } else if (this.prevState && this.prevState.phase === PhaseTypes.INPUT) {
            this.input.removeEventListener('keydown', this.onKeyDown);
        }
    }

    determineAndSetPhase = () => {
        const phase = this.state.typedLetter === null ? PhaseTypes.START : PhaseTypes.FILLED;
        this.setState(prevState => ({ phase }));
    };

    static renderText(text, handler = null, className = '') {
        if (className !== '') {
            className = ` ${className}`;
        }
        return (
            <span onClick={handler} className={`crossword-cell--text${className}`}>
                {text}
            </span>
        );
    }

    static renderIndicator(indicator) {
        return <span className="crossword-cell--indicator">{indicator}</span>;
    }

    renderInput(text) {
        return (
            <input
                type="text"
                onBlur={this.determineAndSetPhase}
                onChange={this.onInput}
                ref={c => {
                    this.input = c;
                }}
                value={text}
                className="crossword-cell--input"
            />
        );
    }

    render() {
        const { phase, typedLetter } = this.state;
        // const letter = this.props.letter === null ? this.letterDefault : this.letterActive;
        const letter = String.fromCharCode(160);
        const clickHandler = this.props.letter === null ? null : this.onCellClick;
        const classNames = [clickHandler ? 'loaded' : 'empty'];
        let indicator = null;
        let el = null;

        if (typedLetter) {
            classNames.push('filled');
        }

        switch (phase) {
            case PhaseTypes.START:
                el = Cell.renderText(letter, clickHandler);
                break;

            case PhaseTypes.INPUT:
                el = this.renderInput(typedLetter || '');
                break;

            case PhaseTypes.FILLED:
                el = Cell.renderText(typedLetter, clickHandler);
                break;

            case PhaseTypes.SHOW:
                if (clickHandler && !classNames.includes('filled')) {
                    classNames.push('filled');
                }
                el = Cell.renderText(this.props.letter || this.letterDefault, clickHandler);
                break;

            default:
            case PhaseTypes.VALIDATE:
                classNames.push(typedLetter !== null && typedLetter === this.props.letter ? 'valid' : 'invalid');
                el = Cell.renderText(typedLetter || this.letterActive, clickHandler);
                break;
        }

        if (this.props.indicator) {
            indicator = Cell.renderIndicator(this.props.indicator);
        }

        // console.log('Cell::render', 'phase=', phase);

        return (
            <div className={`crossword-cell ${classNames.join(' ')}`.trim()}>
                {indicator}
                {el}
            </div>
        );
    }
}

const ConnectedCell = connectToStores(Cell, ['AppStore'], context => {
    const appStore = context.getStore('AppStore');
    const toggleShowCorrectAnswer = appStore.getToggle();
    const validate = appStore.getValidate();
    const nextPosition = appStore.getNextPosition();
    return {
        toggleShowCorrectAnswer,
        validate,
        nextPosition
    };
});

export default ConnectedCell;

export const DisconnectedCell = Cell;

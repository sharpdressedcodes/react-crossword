import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import get from 'lodash/get';
import { cellClicked, cellTyped } from '../actions/cell';
import { PhaseTypes } from '../constants/cell';
import { positionPropType } from '../constants/grid';

class Cell extends Component {
    static displayName = 'Cell';

    static LETTER_DEFAULT = '+';

    static LETTER_ACTIVE = '-';

    static RX_INPUT = /^[a-z+]$/i;

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
        config: PropTypes.object.isRequired,
        executeAction: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired
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
        const payload = {
            position: this.props.position,
            letter: null
        };

        // Give the user the ability to update their input
        if (this.input.value.length > 0) {
            this.input.value = this.input.value.substr(-1);
        }

        if (this.input.value && this.regex.test(this.input.value)) {
            this.input.value = this.input.value.toUpperCase();
            this.setState({ typedLetter: this.input.value });
            this.context.executeAction(cellTyped, { ...payload, letter: this.input.value });
        } else {
            this.input.value = '';
            this.setState({ typedLetter: null });
            this.context.executeAction(cellTyped, payload);
        }
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
            this.input.focus();
        }
    }

    determineAndSetPhase = () => {
        const phase = this.state.typedLetter === null ? PhaseTypes.START : PhaseTypes.FILLED;
        this.setState(prevState => ({ phase }));
    };

    render() {
        const { phase, typedLetter } = this.state;
        const letter = this.props.letter === null ? this.letterDefault : this.letterActive;
        const clickHandler = this.props.letter === null ? null : this.onCellClick;
        const additionalClass = clickHandler == null ? 'empty' : '';
        const additionalTextClass = typedLetter !== null && typedLetter === this.props.letter ? 'valid' : 'invalid';
        let indicator = null;
        let el = null;

        switch (phase) {
            case PhaseTypes.START:
                el = (
                    <span onClick={clickHandler} className="crossword-cell--text">
                        {letter}
                    </span>
                );
                break;

            case PhaseTypes.INPUT:
                el = (
                    <input
                        type="text"
                        onBlur={this.determineAndSetPhase}
                        onChange={this.onInput}
                        ref={c => {
                            this.input = c;
                        }}
                        value={typedLetter || ''}
                        className="crossword-cell--input"
                    />
                );
                break;

            case PhaseTypes.FILLED:
                el = (
                    <span onClick={clickHandler} className="crossword-cell--text">
                        {typedLetter}
                    </span>
                );
                break;

            case PhaseTypes.SHOW:
                el = (
                    <span onClick={clickHandler} className="crossword-cell--text">
                        {this.props.letter || this.letterDefault}
                    </span>
                );
                break;

            default:
            case PhaseTypes.VALIDATE:
                el = (
                    <span onClick={clickHandler} className={`crossword-cell--text ${additionalTextClass}`}>
                        {typedLetter || this.letterActive}
                    </span>
                );
                break;
        }

        if (this.props.indicator) {
            indicator = <span className="crossword-cell--indicator">{this.props.indicator}</span>;
        }

        // console.log('Cell::render', 'phase=', phase);

        return (
            <div className={`crossword-cell ${additionalClass}`.trim()}>
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

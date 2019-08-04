import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import keyMirror from 'keymirror';
import { cellClicked, cellTyped } from '../actions/cell';
import { positionPropType } from '../constants/grid';

class Cell extends Component {
    static displayName = 'Cell';

    static LETTER_DEFAULT = '+';

    static LETTER_ACTIVE = '-';

    static RX_INPUT = /^[a-z+]$/i;

    static propTypes = {
        position: PropTypes.shape(positionPropType).isRequired,
        letter: PropTypes.string,
        letterIndex: PropTypes.number,
        indicator: PropTypes.number,
        toggleShowCorrectAnswer: PropTypes.bool,
        validate: PropTypes.bool,
        nextPosition: PropTypes.shape(positionPropType)
    };

    static defaultProps = {
        letter: null,
        letterIndex: null,
        indicator: null,
        toggleShowCorrectAnswer: false,
        validate: false,
        nextPosition: null
    };

    static contextTypes = {
        executeAction: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired
    };

    static phaseTypes = keyMirror({
        START: null,
        INPUT: null,
        FILLED: null,
        SHOW: null,
        VALIDATE: null
    });

    constructor(props) {
        super(props);

        this.state = {
            phase: Cell.phaseTypes.START,
            typedLetter: null
        };
        this.prevState = this.state;
    }

    onCellClick = event => {
        this.setState({ phase: Cell.phaseTypes.INPUT });
        this.context.executeAction(cellClicked, { position: this.props.position });
    };

    onInput = event => {
        const payload = {
            position: this.props.position,
            // parentWords: this.props.parentWords,
            letter: null
        };

        // Give the user the ability to update their input
        if (this.input.value.length > 0) {
            this.input.value = this.input.value.substr(-1);
        }

        if (this.input.value && Cell.RX_INPUT.test(this.input.value)) {
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
                this.setState({ phase: Cell.phaseTypes.SHOW });
            } else {
                this.setState({ phase: this.prevState.phase });
            }
        }

        if (this.props.letter !== null && nextProps.validate !== this.props.validate) {
            if (nextProps.validate) {
                this.prevState = this.state;
                this.setState({ phase: Cell.phaseTypes.VALIDATE });
            } else {
                this.setState({ phase: this.prevState.phase });
            }
        }

        if (
            nextProps.nextPosition &&
            nextProps.nextPosition !== this.props.nextPosition &&
            this.props.position.x === nextProps.nextPosition.x &&
            this.props.position.y === nextProps.nextPosition.y &&
            this.state.phase !== Cell.phaseTypes.INPUT
        ) {
            this.setState({ phase: Cell.phaseTypes.INPUT });
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
        if (this.state.phase === Cell.phaseTypes.INPUT) {
            this.input.focus();
        }
    }

    determineAndSetPhase = () => {
        const phase = this.state.typedLetter === null ? Cell.phaseTypes.START : Cell.phaseTypes.FILLED;
        this.setState(prevState => ({ phase }));
    };

    render() {
        const { phase, typedLetter } = this.state;
        const letter = this.props.letter === null ? Cell.LETTER_DEFAULT : Cell.LETTER_ACTIVE;
        const clickHandler = this.props.letter === null ? null : this.onCellClick;
        const style = { cursor: 'default', display: 'inline-block', width: '25px', textAlign: 'center' };
        const className = typedLetter !== null && typedLetter === this.props.letter ? 'valid' : 'invalid';
        let indicator = null;
        let el = null;

        if (clickHandler !== null) {
            style.cursor = 'pointer';
        }

        switch (phase) {
            case Cell.phaseTypes.START:
                el = (
                    <span onClick={clickHandler} style={style}>
                        {letter}
                    </span>
                );
                break;

            case Cell.phaseTypes.INPUT:
                el = (
                    <input
                        type="text"
                        onBlur={this.determineAndSetPhase}
                        onChange={this.onInput}
                        style={{ width: '25px', textAlign: 'center', border: 'none' }}
                        ref={c => {
                            this.input = c;
                        }}
                        value={typedLetter}
                    />
                );
                break;

            case Cell.phaseTypes.FILLED:
                el = (
                    <span onClick={clickHandler} style={style}>
                        {typedLetter}
                    </span>
                );
                break;

            case Cell.phaseTypes.SHOW:
                el = (
                    <span onClick={clickHandler} style={style}>
                        {this.props.letter || Cell.LETTER_DEFAULT}
                    </span>
                );
                break;

            default:
            case Cell.phaseTypes.VALIDATE:
                style.outline = `1px solid ${className === 'valid' ? 'green' : 'red'}`;
                el = (
                    <span className={className} onClick={clickHandler} style={style}>
                        {typedLetter || Cell.LETTER_ACTIVE}
                    </span>
                );
                break;
        }

        if (this.props.letterIndex === 0) {
            indicator = (
                <span style={{ position: 'absolute', fontSize: '70%', color: 'lightgrey', pointerEvents: 'none' }}>{this.props.indicator}</span>
            );
        }

        // console.log('Cell::render', 'phase=', phase);

        return (
            <div className="cell" style={{ width: '25px' }}>
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

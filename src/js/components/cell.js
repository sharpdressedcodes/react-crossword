import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { cellClicked, cellTyped } from '../actions/cell';

class Cell extends Component {
    static displayName = 'Cell';

    static LETTER_DEFAULT = '+';
    static LETTER_ACTIVE = '-';

    static propTypes = {
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        letter: PropTypes.string,
        letterIndex: PropTypes.number,
        indicator: PropTypes.number,
        toggleShowCorrectAnswer: PropTypes.bool,
        validate: PropTypes.bool
    };

    static defaultProps = {
        letter: null,
        letterIndex: null,
        indicator: null,
        toggleShowCorrectAnswer: false,
        validate: false
    };

    static contextTypes = {
        executeAction: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            phase: 'start',
            typedLetter: null
        };
        this.prevState = this.state;
    }

    onCellClick = (event) => {
        this.setState({phase: 'input'});
        this.context.executeAction(cellClicked, { position: this.props.position });
    };

    onInput = (event) => {

        if (this.input.value && /^[a-zA-Z]$/.test(this.input.value)) {

            this.input.value = this.input.value.toUpperCase();
            this.setState({typedLetter: this.input.value});
            this.context.executeAction(cellTyped, { position: this.props.position, letter: this.input.value });

        } else {

            this.input.value = '';
            this.setState({typedLetter: null});
            this.context.executeAction(cellTyped, { position: this.props.position, letter: null });
        }
    };

    componentWillReceiveProps(nextProps) {

        if (nextProps.toggleShowCorrectAnswer !== this.props.toggleShowCorrectAnswer) {
            if (nextProps.toggleShowCorrectAnswer) {
                this.prevState = this.state;
                this.setState({ phase: 'show' });
            } else {
                this.setState({ phase: this.prevState.phase });
            }
        }

        if (this.props.letter !== null && nextProps.validate !== this.props.validate) {
            if (nextProps.validate) {
                this.prevState = this.state;
                this.setState({ phase: 'validate' });
            } else {
                this.setState({ phase: this.prevState.phase });
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const phaseChanged = this.state.phase !== nextState.phase;
        const toggleShowCorrectAnswerChanged = this.props.letter !== null && this.props.toggleShowCorrectAnswer !== nextProps.toggleShowCorrectAnswer;
        const validateChanged = this.props.letter !== null && this.props.validate !== nextProps.validate;

        //console.log('Cell::shouldComponentUpdate', phaseChanged, toggleShowCorrectAnswerChanged, validateChanged, nextProps, nextState);

        return phaseChanged || toggleShowCorrectAnswerChanged || validateChanged;
    }

    determineAndSetPhase = () => {
        this.setState({ phase: this.state.typedLetter === null ? 'start' : 'filled' });
    };

    render() {
        const { phase, typedLetter } = this.state;
        const letter = this.props.letter === null ? Cell.LETTER_DEFAULT : Cell.LETTER_ACTIVE;
        const clickHandler = this.props.letter === null ? null : this.onCellClick;
        const style = {cursor: 'default', display: 'inline-block', width: '25px', textAlign: 'center'};
        let indicator = null;
        let el = null;

        if (clickHandler !== null) {
            style.cursor = 'pointer';
        }

        switch (phase) {
            case 'start':
                el = <span onClick={clickHandler} style={style}>{letter}</span>;
                break;

            case 'input':
                el = (
                    <input
                        autoFocus
                        type="text"
                        onBlur={this.determineAndSetPhase}
                        onChange={this.onInput}
                        style={{width: '25px', textAlign: 'center', border: 'none'}}
                        pattern="^[a-zA-Z]{1}$"
                        ref={c => {this.input = c;}}
                        maxLength="1"
                    />
                );
                break;

            case 'filled':
                el = <span onClick={clickHandler} style={style}>{typedLetter}</span>;
                break;

            case 'show':
                el = <span onClick={clickHandler} style={style}>{this.props.letter || Cell.LETTER_DEFAULT}</span>;
                break;

            case 'validate':
                const className = typedLetter !== null && typedLetter === this.props.letter ? 'valid' : 'invalid';
                style.outline = '1px solid ' + (className === 'valid' ? 'green' : 'red');
                el = <span className={className} onClick={clickHandler} style={style}>{typedLetter || Cell.LETTER_ACTIVE}</span>;
                break;
        }

        if (this.props.letterIndex === 0) {
            indicator = <span style={{position: 'absolute', fontSize: '70%', color: 'lightgrey', pointerEvents: 'none'}}>{this.props.indicator}</span>
        }

        //console.log('Cell::render', 'phase=', phase);

        return (
            <div className="cell" style={{width: '25px'}}>
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
    return {
        toggleShowCorrectAnswer,
        validate
    };
});

export default ConnectedCell;

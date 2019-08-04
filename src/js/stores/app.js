import { BaseStore } from 'fluxible/addons';
import CellActionTypes from '../constants/cell';
import GridActionTypes from '../constants/grid';
import CrosswordActionTypes from '../constants/crossword';

const { CELL_CLICKED, CELL_TYPED } = CellActionTypes;
const { ADD_INPUT_CELL, GUESS_NEXT_INPUT_CELL } = GridActionTypes;
const { TOGGLE_SHOW_CORRECT_ANSWER, VALIDATE_CELLS } = CrosswordActionTypes;

class AppStore extends BaseStore {
    static storeName = 'AppStore';

    static handlers = {};

    constructor(dispatcher) {
        super(dispatcher);

        this.position = { x: -1, y: -1 };
        this.toggle = false;
        this.validate = false;
        this.typedLetters = [];
        this.lastTypedLetter = null;
        this.nextPosition = null;
    }

    // Getters
    getState() {
        return {
            position: this.position,
            toggle: this.toggle,
            validate: this.validate,
            typedLetters: this.typedLetters,
            lastTypedLetter: this.lastTypedLetter,
            nextPosition: this.nextPosition
        };
    }

    getPosition = () => this.position;

    getNextPosition = () => this.nextPosition;

    getTypedLetters = () => this.typedLetters;

    getToggle = () => this.toggle;

    getValidate = () => this.validate;

    getLastTypedLetter = () => this.lastTypedLetter;

    // Methods
    updateTypedLetter = (position, letter) => {
        for (let i = 0, len = this.typedLetters.length; i < len; i++) {
            if (this.typedLetters[i].position.x === position.x && this.typedLetters[i].position.y === position.y) {
                this.typedLetters[i].letter = letter;
                this.lastTypedLetter = this.typedLetters[i];
                break;
            }
        }
    };

    // Handlers
    onCellClicked = payload => {
        this.position = payload.position;
        this.emitChange();
    };

    onCellTyped = payload => {
        this.updateTypedLetter(payload.position, payload.letter);
        this.emitChange();
    };

    onToggleShowCorrectAnswer = payload => {
        this.toggle = payload.toggle;
        this.emitChange();
    };

    onValidateCells = payload => {
        if (payload.validate && this.validate) {
            this.validate = false;
            this.emitChange();
        }

        this.validate = payload.validate;
        this.emitChange();
    };

    onAddInputCell = payload => {
        this.typedLetters.push({
            ...payload
        });
        this.emitChange();
    };

    onGuessNextInputCell = payload => {
        this.nextPosition = payload.position;
        this.emitChange();
    };

    dehydrate() {
        return this.getState();
    }

    rehydrate(state) {
        this.position = state.position;
        this.toggle = state.toggle;
        this.validate = state.validate;
        this.typedLetters = state.typedLetters;
        this.lastTypedLetter = state.lastTypedLetter;
        this.nextPosition = state.nextPosition;
    }
}

AppStore.handlers[CELL_CLICKED] = 'onCellClicked';
AppStore.handlers[CELL_TYPED] = 'onCellTyped';
AppStore.handlers[ADD_INPUT_CELL] = 'onAddInputCell';
AppStore.handlers[GUESS_NEXT_INPUT_CELL] = 'onGuessNextInputCell';
AppStore.handlers[TOGGLE_SHOW_CORRECT_ANSWER] = 'onToggleShowCorrectAnswer';
AppStore.handlers[VALIDATE_CELLS] = 'onValidateCells';

export default AppStore;

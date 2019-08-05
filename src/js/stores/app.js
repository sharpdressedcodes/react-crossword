import { BaseStore } from 'fluxible/addons';
import CellActionTypes from '../constants/cell';
import GridActionTypes, { DirectionTypes } from '../constants/grid';
import CrosswordActionTypes from '../constants/crossword';
import AppActionTypes from '../constants/app';
const { CELL_CLICKED, CELL_TYPED } = CellActionTypes;
const { ADD_INPUT_CELL } = GridActionTypes;
const { TOGGLE_SHOW_CORRECT_ANSWER, VALIDATE_CELLS } = CrosswordActionTypes;
const { APP_LOADED } = AppActionTypes;

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
        this.direction = null;

        this.maxGridWidth = 0;
        this.maxGridHeight = 0;
        this.validatedWords = [];
    }

    // Getters
    getState() {
        return {
            position: this.position,
            toggle: this.toggle,
            validate: this.validate,
            typedLetters: this.typedLetters,
            lastTypedLetter: this.lastTypedLetter,
            nextPosition: this.nextPosition,
            direction: this.direction,

            maxGridWidth: this.maxGridWidth,
            maxGridHeight: this.maxGridHeight,
            validatedWords: this.validatedWords
        };
    }

    getPosition = () => this.position;

    getNextPosition = () => this.nextPosition;

    getTypedLetters = () => this.typedLetters;

    getToggle = () => this.toggle;

    getValidate = () => this.validate;

    getLastTypedLetter = () => this.lastTypedLetter;

    getDirection = () => this.direction;

    getValidatedWords = () => this.validatedWords;

    getMaxGridWidth = () => this.maxGridWidth;

    getMaxGridHeight = () => this.maxGridHeight;

    // Methods
    updateTypedLetter(position, letter) {
        for (let i = 0, len = this.typedLetters.length; i < len; i++) {
            if (this.typedLetters[i].position.x === position.x && this.typedLetters[i].position.y === position.y) {
                this.typedLetters[i].letter = letter;
                this.lastTypedLetter = this.typedLetters[i];
                break;
            }
        }
    }

    findTypedLetterByPosition(position) {
        let result = this.typedLetters.find(typedLetter => {
            return typedLetter.position.x === position.x && typedLetter.position.y === position.y;
        });

        if (typeof result === 'undefined') {
            result = null;
        }

        return result;
    }

    guessNextPosition(position) {
        const typedLetter = this.findTypedLetterByPosition(position);
        let nextPosition = null;

        switch (this.direction) {
            case DirectionTypes.VERTICAL:
                // Check vertical first, if this fails, check horizontal
                nextPosition = this.checkNextVerticalPosition(typedLetter);
                if (!nextPosition) {
                    nextPosition = this.checkNextHorizontalPosition(typedLetter);
                }
                break;

            case DirectionTypes.HORIZONTAL:
            default:
                // No direction specified/check horizontal first, then check vertical
                nextPosition = this.checkNextHorizontalPosition(typedLetter);
                if (!nextPosition) {
                    nextPosition = this.checkNextVerticalPosition(typedLetter);
                }
        }

        return nextPosition;
    }

    checkNextHorizontalPosition(typedLetter) {
        let nextPosition = null;
        let nextValue = null;

        typedLetter.parentWords.every(word => {
            if (word.horizontal) {
                // Look for the next x
                nextValue = typedLetter.position.x + 1;
                // Are we at the end of the word or grid?
                if (nextValue <= word.endX && nextValue < this.maxGridWidth) {
                    nextPosition = { x: nextValue, y: typedLetter.position.y };
                    this.direction = DirectionTypes.HORIZONTAL;
                }
            }
            return nextPosition == null;
        });

        return nextPosition;
    }

    checkNextVerticalPosition(typedLetter) {
        let nextPosition = null;
        let nextValue = null;

        typedLetter.parentWords.every(word => {
            if (!word.horizontal) {
                // Look for the next y
                nextValue = typedLetter.position.y + 1;
                // Are we at the end of the word or grid?
                if (nextValue <= word.endY && nextValue < this.maxGridHeight) {
                    nextPosition = { x: typedLetter.position.x, y: nextValue };
                    this.direction = DirectionTypes.VERTICAL;
                }
            }
            return nextPosition == null;
        });

        return nextPosition;
    }

    validateWords(words) {
        const validatedWords = [];
        words.forEach((word, index) => {
            let correct = true;
            let firstLetter = null;

            if (word.horizontal) {
                for (let i = word.startX, letterIndex = 0; i <= word.endX; i++, letterIndex++) {
                    const letter = word.answer.substr(letterIndex, 1);
                    const position = { x: i, y: word.startY };
                    const typedLetter = this.findTypedLetterByPosition(position);

                    if (!firstLetter) {
                        firstLetter = typedLetter;
                    }

                    if (letter !== typedLetter.letter) {
                        correct = false;
                        break;
                    }
                }
            } else {
                for (let i = word.startY, letterIndex = 0; i <= word.endY; i++, letterIndex++) {
                    const letter = word.answer.substr(letterIndex, 1);
                    const position = { x: word.startX, y: i };
                    const typedLetter = this.findTypedLetterByPosition(position);

                    if (!firstLetter) {
                        firstLetter = typedLetter;
                    }

                    if (letter !== typedLetter.letter) {
                        correct = false;
                        break;
                    }
                }
            }

            validatedWords.push({
                index: index + 1,
                indicator: firstLetter.indicator,
                correct,
                answer: word.answer
            });
        });
        return validatedWords;
    }

    // Handlers
    onAppLoaded = payload => {
        this.maxGridWidth = payload.maxGridWidth;
        this.maxGridHeight = payload.maxGridHeight;
    };

    onCellClicked = payload => {
        this.position = payload.position;
        this.emitChange();
    };

    onCellTyped = payload => {
        this.updateTypedLetter(payload.position, payload.letter);
        if (payload.letter) {
            this.nextPosition = this.guessNextPosition(payload.position);
        }
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

        this.validatedWords = this.validateWords(payload.words);
        this.validate = payload.validate;

        this.emitChange();
    };

    onAddInputCell = payload => {
        this.typedLetters.push({
            ...payload
        });
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
        this.direction = state.direction;

        this.maxGridWidth = state.maxGridWidth;
        this.maxGridHeight = state.maxGridHeight;
        this.validatedWords = state.validatedWords;
    }
}

AppStore.handlers[APP_LOADED] = 'onAppLoaded';
AppStore.handlers[CELL_CLICKED] = 'onCellClicked';
AppStore.handlers[CELL_TYPED] = 'onCellTyped';
AppStore.handlers[ADD_INPUT_CELL] = 'onAddInputCell';
AppStore.handlers[TOGGLE_SHOW_CORRECT_ANSWER] = 'onToggleShowCorrectAnswer';
AppStore.handlers[VALIDATE_CELLS] = 'onValidateCells';

export default AppStore;

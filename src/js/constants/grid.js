import PropTypes from 'prop-types';
import keyMirror from 'keymirror';
import { wordPropType as crosswordWordPropType } from './crossword';

const ActionTypes = keyMirror({
    ADD_INPUT_CELL: null,
    GUESS_NEXT_INPUT_CELL: null
});

export const wordPropType = {
    ...crosswordWordPropType,
    horizontal: PropTypes.bool.isRequired
};

export const positionPropType = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
};

export const typedLetterPropType = {
    position: PropTypes.shape(positionPropType).isRequired,
    letter: PropTypes.string,
    indicator: PropTypes.number,
    parentWords: PropTypes.arrayOf(PropTypes.shape(wordPropType)).isRequired
};

export const DirectionTypes = keyMirror({
    HORIZONTAL: null,
    VERTICAL: null
});

export default ActionTypes;

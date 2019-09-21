import PropTypes from 'prop-types';
import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
    TOGGLE_SHOW_CORRECT_ANSWER: null,
    VALIDATE_CELLS: null
});

export const wordPropType = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    startX: PropTypes.number.isRequired,
    startY: PropTypes.number.isRequired,
    endX: PropTypes.number.isRequired,
    endY: PropTypes.number.isRequired
};

export default ActionTypes;

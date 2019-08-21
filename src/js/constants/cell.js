import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
    CELL_CLICKED: null,
    CELL_TYPED: null,
    CELL_NAVIGATED: null
});

export const PhaseTypes = keyMirror({
    START: null,
    INPUT: null,
    FILLED: null,
    SHOW: null,
    VALIDATE: null
});

export default ActionTypes;

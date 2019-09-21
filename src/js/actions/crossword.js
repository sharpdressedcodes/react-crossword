import ActionTypes from '../constants/crossword';

export function toggleShowCorrectAnswer(context, payload) {
    context.dispatch(ActionTypes.TOGGLE_SHOW_CORRECT_ANSWER, payload);
}

export function validateCells(context, payload) {
    context.dispatch(ActionTypes.VALIDATE_CELLS, payload);
}

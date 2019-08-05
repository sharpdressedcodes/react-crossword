import ActionTypes from '../constants/grid';

export function addInputCell(context, payload) {
    context.dispatch(ActionTypes.ADD_INPUT_CELL, payload);
}

export function guessNextInputCell(context, payload) {
    context.dispatch(ActionTypes.GUESS_NEXT_INPUT_CELL, payload);
}

import ActionTypes from '../constants/grid';

export function addInputCell(context, payload) {
    context.dispatch(ActionTypes.ADD_INPUT_CELL, payload);
}

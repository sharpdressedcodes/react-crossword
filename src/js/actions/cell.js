import ActionTypes from '../constants/cell';

export function cellClicked(context, payload) {
    context.dispatch(ActionTypes.CELL_CLICKED, payload);
}

export function cellTyped(context, payload) {
    context.dispatch(ActionTypes.CELL_TYPED, payload);
}
export function cellNavigated(context, payload) {
    context.dispatch(ActionTypes.CELL_NAVIGATED, payload);
}

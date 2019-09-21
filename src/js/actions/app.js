import ActionTypes from '../constants/app';

export function appLoaded(context, payload) {
    context.dispatch(ActionTypes.APP_LOADED, payload);
}

export function appRendered(context, payload) {
    context.dispatch(ActionTypes.APP_RENDERED, payload);
}

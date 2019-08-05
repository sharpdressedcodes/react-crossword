import ActionTypes from '../constants/app';

export function appLoaded(context, payload) {
    context.dispatch(ActionTypes.APP_LOADED, payload);
}

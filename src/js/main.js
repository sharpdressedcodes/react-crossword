import React from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import Fluxible from 'fluxible';
import { connectToStores, createElementWithContext, provideContext } from 'fluxible-addons-react';
import fluxibleConfigPlugin from 'fluxible-plugin-context-config';
import AppStore from './stores/app';
import App from './components/app';
import config from './config/main';

((win, doc) => {
    const onLoad = event => {
        const root = doc.getElementById('app');
        const stores = [AppStore];
        const ConnectedApp = provideContext(
            connectToStores(App, stores, (context, props) => {
                return context.getStore(AppStore).getState();
            }),
            { config: PropTypes.object.isRequired }
        );
        const app = new Fluxible({
            component: ConnectedApp,
            stores
        });
        app.plug(fluxibleConfigPlugin(config));
        const context = app.createContext();
        const element = createElementWithContext(context);
        render(element, root, () => {
            root.style.opacity = 1;
        });
    };

    win.addEventListener('load', onLoad, false);
})(window, document);

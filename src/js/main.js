import React from 'react';
import { render } from 'react-dom';
import Fluxible from 'fluxible';
import { connectToStores, createElementWithContext, provideContext } from 'fluxible-addons-react';
import AppStore from './stores/app';
import App from './components/app';

((win, doc) => {

    const onLoad = (event) => {
        const root = doc.getElementById('app');
        const stores = [AppStore];
        const ConnectedApp = provideContext(connectToStores(App, stores, (context, props) => {
            return context.getStore(AppStore).getState();
        }));
        const app = new Fluxible({
            component: ConnectedApp,
            stores
        });
        const context = app.createContext();
        const element = createElementWithContext(context);
        render(element, root);
    };

    win.addEventListener('load', onLoad, false);
})(window, document);

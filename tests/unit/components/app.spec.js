import React from 'react';
// import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from '../../../src/js/components/app';
import config from '../../../src/js/config/main';

configure({ adapter: new Adapter() });

const context = {
    executeAction: () => {},
    getStore: (store) => {
        return {
            on: () => {}
        };
    },
    config
};

describe(`Making sure the app renders correctly`, () => {

    // it(`tree matches snapshot`, () => {
    //     let component = renderer.create(<App />);
    //     let tree = component.toJSON();
    //     expect(tree).toMatchSnapshot();
    // });

    it(`Renders the App component`, () => {

        let component = shallow(<App/>, { context });
        expect(component.instance().props.validatedWords.length).toEqual(0);
        expect(component.find('h1').length).toEqual(1);
    });
});

import React from 'react';
import renderer from 'react-test-renderer';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { DisconnectedCell as Cell } from '../../../src/js/components/cell';
import config from '../../../src/js/config/main';

configure({ adapter: new Adapter() });

const context = {
    executeAction: () => {},
    getStore: (store) => {
        return {
            on: () => {},
            getToggle: () => false,
            getValidate: () => false,
            getNextPosition: () => null
        };
    },
    config
};

const props = {
    position: { x: 0, y: 0},
    letter: 'A',
    indicator: 1,
    key: 'cell-0'
};

let component = null;

describe(`Make sure the cell renders correctly`, () => {

    beforeEach(() => {
        component = mount(<Cell { ...props } />, { context });
    });

    it(`renders`, () => {

        let cell = renderer.create(<Cell { ...props } />);
        let tree = cell.toJSON();
        expect(tree).toMatchSnapshot();

        expect(component.find('span').length).toEqual(2); // indicator + text
        expect(component.find('input').length).toEqual(0);
    });


});

describe(`Make sure the Cell responds correctly`, () => {

    beforeEach(() => {
        component = mount(<Cell { ...props } />, { context });
    });

    it(`Changes from START to INPUT phases when clicked, and vise versa`, () => {
        const spanCount = component.find('span').length;

        // Check phase is START
        expect(component.state('phase')).toEqual('START');

        let input = component.find('input');

        // Make sure the input element is not there
        expect(input.length).toEqual(0);

        // Simulate a click, this should change the state of the cell
        component.find('.crossword-cell--text').simulate('click');

        // Check phase is now INPUT
        expect(component.state('phase')).toEqual('INPUT');

        // Look for input again
        input = component.find('input');

        // Make sure the input element is there
        expect(input.length).toEqual(1);

        // Make sure the text element has been removed
        expect(component.find('span').length + 1).toEqual(spanCount);

        // Click away from the input
        input.simulate('blur');

        // Look for input again
        input = component.find('input');

        // Make sure the input element is not there
        expect(input.length).toEqual(0);

        // Make sure the input has been replaced with span
        expect(component.find('span').length).toEqual(spanCount);

        // Make sure the state is in the START phase
        expect(component.state('phase')).toEqual('START');
    });

    it(`Only allows correct letters`, () => {

        // Make sure the typedLetter is null
        expect(component.state('typedLetter')).toEqual(null);

        // Click the cell
        component.find('.crossword-cell--text').simulate('click');

        const input = component.find('input');
        input.simulate('change', { target: { value: 5 } });

        expect(component.state('typedLetter')).toEqual(null);
        expect(component.state('phase')).toEqual('INPUT');

        input.simulate('change', { target: { value: 'A' } });

        expect(component.state('typedLetter')).toEqual('A');

        input.simulate('blur');

        expect(component.state('phase')).toEqual('FILLED');
    });
});

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from './button';
import { buttonPropType, defaultButtonProps } from '../constants/button';

class ToggleButton extends Component {
    static displayName = 'ToggleButton';

    static propTypes = {
        on: PropTypes.shape(buttonPropType),
        off: PropTypes.shape(buttonPropType)
    };

    static defaultProps = {
        on: { ...defaultButtonProps },
        off: { ...defaultButtonProps }
    };

    constructor(props) {
        super(props);

        this.state = {
            toggled: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const toggledChanged = nextState !== this.state.toggled;
        return toggledChanged;
    }

    clickHandler = event => {
        const { toggled } = this.state;
        const { on, off } = this.props;
        const handler = toggled ? off.clickHandler : on.clickHandler;

        this.setState({ toggled: !toggled });
        handler.call(this, event);
    };

    render() {
        const { toggled } = this.state;
        const { on, off } = this.props;
        const which = toggled && off.text !== '' ? off : on;

        return <Button {...which} clickHandler={this.clickHandler} />;
    }
}

export default ToggleButton;

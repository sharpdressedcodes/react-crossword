import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from './button';

class ToggleButton extends Component {
    static displayName = 'ToggleButton';

    static propTypes = {
        on: PropTypes.shape(Object.assign({}, Button.propTypes)),
        off: PropTypes.shape(Object.assign({}, Button.propTypes))
    };

    static defaultProps = {
        on: Object.assign({}, Button.defaultProps),
        off: Object.assign({}, Button.defaultProps)
    };

    constructor(props) {
        super(props);

        this.state = {
            toggled: false
        };

        if (this.props.off.text === '') {
            this.props.off.text = this.props.on.text;
        }

        const noop = () => {};
        if (this.props.off.clickHandler === noop) {
            this.props.off.clickHandler = this.props.on.clickHandler;
        }

        if (this.props.off.className === '') {
            this.props.off.className = this.props.on.className;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const toggledChanged = nextState !== this.state.toggled;
        return toggledChanged;
    }

    clickHandler = event => {
        const { toggled } = this.state;
        const handler = toggled ? this.props.off.clickHandler : this.props.on.clickHandler;

        this.setState({ toggled: !toggled });
        handler.call(this, event);
    };

    render() {
        const { toggled } = this.state;
        const which = toggled ? this.props.off : this.props.on;

        return <Button {...which} clickHandler={this.clickHandler} />;
    }
}

export default ToggleButton;

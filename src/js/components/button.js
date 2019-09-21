import React, { Component } from 'react';
import { buttonPropType, defaultButtonProps } from '../constants/button';

class Button extends Component {
    static displayName = 'Button';

    static propTypes = { ...buttonPropType };

    static defaultProps = { ...defaultButtonProps };

    shouldComponentUpdate(nextProps, nextState) {
        const textChanged = nextProps.text !== this.props.text;
        const classNameChanged = nextProps.className !== this.props.className;

        return textChanged || classNameChanged;
    }

    render() {
        const { text, clickHandler, className } = this.props;
        return (
            <button className={`button ${className}`} onClick={clickHandler}>
                {text}
            </button>
        );
    }
}

export default Button;

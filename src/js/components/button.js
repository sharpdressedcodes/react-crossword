import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Button extends Component {
    static displayName = 'Button';

    static propTypes = {
        text: PropTypes.string,
        clickHandler: PropTypes.func,
        className: PropTypes.string
    };

    static defaultProps = {
        text: '',
        clickHandler: () => {},
        className: ''
    };

    shouldComponentUpdate(nextProps, nextState) {
        const textChanged = nextProps.text !== this.props.text;
        const classNameChanged = nextProps.className !== this.props.className;

        return textChanged || classNameChanged;
    }

    render() {
        const { text, clickHandler, className } = this.props;
        return (
            <button className={className} onClick={clickHandler} ref={c => {this.button = c;}}>{text}</button>
        );
    }
}

export default Button;

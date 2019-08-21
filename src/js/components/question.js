import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Question extends Component {
    static displayName = 'Question';

    static propTypes = {
        question: PropTypes.string.isRequired,
        index: PropTypes.number,
        className: PropTypes.string
    };

    static defaultProps = {
        index: null,
        className: ''
    };

    shouldComponentUpdate(nextProps, nextState) {
        const classNameChanged = nextProps.className !== this.props.className;
        return classNameChanged;
    }

    render() {
        const { question, index, className } = this.props;
        const indexElement = index === null ? null : <span className="crossword-question--index">{index}</span>;

        return (
            <div className={`crossword-question ${className}`.trim()}>
                {indexElement}
                <span className="crossword-question--text">{question}</span>
            </div>
        );
    }
}

export default Question;

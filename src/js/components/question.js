import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Question extends Component {
    static displayName = 'Question';

    static propTypes = {
        question: PropTypes.string.isRequired,
        index: PropTypes.number
    };

    static defaultProps = {
        index: null
    };

    shouldComponentUpdate = () => false;

    render() {
        const { question, index } = this.props;
        const indexElement = index === null ? null : <span className="crossword-question--index">{index}</span>;

        return (
            <div className="crossword-question">
                {indexElement}
                <span className="crossword-question--text">{question}</span>
            </div>
        );
    }
}

export default Question;

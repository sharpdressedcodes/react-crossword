import React from 'react';
import PropTypes from 'prop-types';

function Row(props) {
    const { cells } = props;
    return <section className="crossword-row">{cells}</section>;
}

Row.displayName = 'Row';
Row.propTypes = {
    cells: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Row;

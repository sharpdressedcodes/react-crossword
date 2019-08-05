import React from 'react';
import PropTypes from 'prop-types';

function Row(props) {
    const { cells } = props;
    const style = {
        display: 'flex'
        // justifyContent: 'space-evenly'
    };

    return (
        <section className="row" style={style}>
            {cells}
        </section>
    );
}

Row.displayName = 'Row';
Row.propTypes = {
    cells: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Row;

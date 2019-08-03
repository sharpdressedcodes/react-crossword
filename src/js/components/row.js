import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Row extends Component {
    static displayName = 'Row';

    static propTypes = {
        cells: PropTypes.arrayOf(PropTypes.object).isRequired
    };

    render() {
        const { cells } = this.props;
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
}

export default Row;

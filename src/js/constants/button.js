import PropTypes from 'prop-types';

export const buttonPropType = {
    text: PropTypes.string,
    clickHandler: PropTypes.func,
    className: PropTypes.string
};

export const defaultButtonProps = {
    text: '',
    clickHandler: () => {},
    className: ''
};

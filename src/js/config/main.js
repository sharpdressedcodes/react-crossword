import words from '../../../data/words';
// import words from '../../../data/words2';

const production = process.env.NODE_ENV === 'production';

const config = {
    app: {
        maxGridWidth: 15, // cells
        maxGridHeight: 15, // cells
        maxWords: 10,
        words,
        cell: {
            letterDefault: '+',
            letterActive: '-',
            regEx: /^[a-z+]$/i
        }
    }
};

export default config;

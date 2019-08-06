module.exports = {
    "verbose": true,
    //"collectCoverage": true,
    "collectCoverageFrom": [
        "./src/js/**/*.{js,jsx}",
        "!./src/js/**/node_modules/**"
    ],
    "coverageDirectory": "./tests/unit/coverage",
    "testURL": "http://127.0.0.1:3001/"
};

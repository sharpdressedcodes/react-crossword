# React Crossword

### Setup
Install dependencies:
```
npm i
```

Build everything:
```
npm run build
```

Serve the files from `./dist` directory:
```
npm run start
```

Now open [http://127.0.0.1:3001/](http://127.0.0.1:3001/) in your browser.

### Data
There are 2 data files located inside `./data`. You can switch between them by modifying the configuration inside `./src/js/config/main.js`. Remember to rebuild the project after switching.

### Tests
#### Unit
Jest and Enzyme are being used in this project. The test files are located in `./tests/unit/components`
```
npm run test
```

#### Functional
Cypress is being used to test outside functionality. The test files are located in `./tests/functional/integration`
Open Cypress:
```
npm run test:functional
```
OR
```
npx cypress open
```
This will open up a UI where you can run/stop tests, and view the output of each test. It will open a Chrome window to perform the actual tests.

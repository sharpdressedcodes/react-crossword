const express = require('express');
const fs = require('fs');

const server = express();
const cwd = process.cwd();
const production = process.env.NODE_ENV === 'production';

server.get('/', (req, res, next) => {

    fs.readFile('./src/index.html', 'utf-8', (err, data) => {
    // fs.readFile('./dist/bundle.js', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
        res.send(data);
    });
});

server.use('/', express.static(`${cwd}/dist`, { maxAge: production ? '1y' : 0, fallthrough: false }));

const listener = server.listen(process.env.PORT || 3001, err => {
    if (err) {
        throw err;
    }
    // eslint-disable-next-line
    console.log(`server listening on port ${listener.address().port}`);
});

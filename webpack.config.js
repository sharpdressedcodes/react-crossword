const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const production = process.env.NODE_ENV === 'production';
//const isDebug = process.env.APP_DEBUG === 'true';

//if (isDebug) {
    process.traceDeprecation = true;
//}

const config = {
    bail: true,
    cache: false,
    // devtool: 'source-map',
    devtool: false,
    context: __dirname + '/',
    entry: './src/js/main.js',
    output: {
        //path: path.resolve(__dirname, '/dist/'),
        publicPath: '/dist/',
        path: __dirname + '/dist/',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                //exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins: [[require('@babel/plugin-proposal-decorators'), { legacy: true }]]
                    }
                }
            } /* ,
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' } */
        ]
    },
    plugins: []
};

if (production) {
    config.plugins.push(
        new UglifyJsPlugin({
            sourceMap: false, // Enabling this will add around 8 seconds to build time
            parallel: true,
            uglifyOptions: {
                beautify: false,
                mangle: false, // Enabling this will add around 3 seconds to build time
                compress: false // Enabling this will add around 20 seconds to build time
            }
        })
    );
}

module.exports = config;

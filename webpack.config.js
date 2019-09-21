const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const production = process.env.NODE_ENV === 'production';
//const isDebug = process.env.APP_DEBUG === 'true';

//if (isDebug) {
    process.traceDeprecation = true;
//}

const config = {
    bail: true,
    cache: false,
    devtool: production ? false : 'eval-source-map',
    context: __dirname + '/',
    entry: ['./src/js/main.js', './src/scss/main.scss'],
    output: {
        publicPath: '/dist/',
        path: __dirname + '/dist/',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            /*
                ensure there is only one instance of react when resolving modules
                this helps with symlinks
            */
            react: path.join(__dirname, 'node_modules/react'),
            'react-dom': path.join(__dirname, 'node_modules/react-dom')
        }
    },
    watchOptions: {
        aggregateTimeout: 600,
        poll: 1000
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
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
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            //minimize: production
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: false,
                            plugins: () => [
                                autoprefixer({
                                    //overrideBrowserslist: ['last 2 versions', 'ie >= 10', 'ios >= 9', 'Android >= 4']
                                })
                            ]
                        }
                    },
                    'resolve-url-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: false,
                            outputStyle: 'compressed'
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            //filename: `[name]${production ? '-[contenthash]' : ''}.css`
            filename: `bundle.css`
        })
    ]
};

if (production) {
    config.plugins.push(
        new UglifyJsPlugin({
            sourceMap: false,
            parallel: true,
            uglifyOptions: {
                beautify: false,
                mangle: false,
                compress: false
            }
        })
    );
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    );
}

module.exports = config;

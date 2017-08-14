const webpack = require('webpack');
const path    = require('path');
const DotEnv  = require('dotenv-webpack');

const config = {
    /*
     * 集約先？のJS。app.jsだとサーバサイドになりそう
     * 絶対パスで指定する必要がある
     */
    entry  : {
        playGround: './client/playGround.js',
        scenarios : './client/scenarios.js',
    },
    output : {
    /*
     * 出力先ディレクトリとファイル名
     */
        path    : `${__dirname}/js`,
        filename: '[name].bundle.js'
    },
    devtool: 'inline-source-map',
    target : 'electron',
    node   : {
        __dirname : false,
        __filename: false,
    },
    module : {
        loaders: [
        ]
    },
    plugins: [
        new DotEnv({
            path: `./.env`,
            safe: false
        })
    ]
};

module.exports = config;
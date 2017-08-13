const webpack = require('webpack');
const path    = require('path');

const config = {
    /*
     * 集約先？のJS。app.jsだとサーバサイドになりそう
     * 絶対パスで指定する必要がある
     */
    entry  : {
        playGround: './client/playGround.js',
    },
    output : {
    /*
     * 出力先ディレクトリとファイル名
     */
        path    : `${__dirname}/js`,
        filename: '[name].bundle.js'
    },
    // optimize:'minimize',
    devtool: 'inline-source-map',
    target : "atom",
    module : {
        loaders: [
        ]
    }
};

module.exports = config;
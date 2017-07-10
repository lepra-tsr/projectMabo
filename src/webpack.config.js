const webpack = require('webpack');
const path    = require('path');

const config = {
    /*
     * 集約先？のJS。app.jsだとサーバサイドになりそう
     * 絶対パスで指定する必要がある
     */
    entry  : './client/chat.js',
    output : {
    /*
     * 出力先ディレクトリとファイル名
     */
        path    : `${__dirname}/public/js`,
        filename: 'client_bundle.js'
    },
};

module.exports = config;
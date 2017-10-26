const webpack               = require('webpack');
const path                  = require('path');
const DotEnv                = require('dotenv-webpack');
const WebpackNotifierPlugin = require('webpack-notifier');

const config = {
  entry  : {
    theater  : './client/theater.js',
    scenarios: './client/scenarios.js',
  },
  output : {
    path    : `${__dirname}/public/js`,
    filename: '[name].bundle.js'
  },
  /*
   * .map.jsファイルを出力(デバッグ用)
   */
  devtool: 'inline-source-map',
  /*
   * electron用にBundleする設定、パスの指定方法
   */
  // target : 'electron',
  // node   : {
  //   __dirname : false,
  //   __filename: false,
  // },
  module : {
    rules  : [
      {
        test   : /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
    ],
    loaders: [
      {
        /*
         * デフォルトではnode_modulesを全てbundleしようとするので除外
         */
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      /*
       * @SEE https://qiita.com/usk83/items/a06d7a6080c7f2b7ef0a
       *
       * jqueryで参照するモジュールを、node_modules内のjqueryに固定する
       * materiarize-cssの内部で参照するjqueryをnode_modules内のものに紐付ける
       * (∴materialize-css内部のvelocityも、このjqueryに紐付けられることになる)
       */
      jquery           : path.join(__dirname, 'node_modules', 'jquery'),
    }
  },
  plugins: [
    /*
     * @SEE https://qiita.com/usk83/items/a06d7a6080c7f2b7ef0a
     *
     * $またはjQueryが呼び出されたらjqueryのモジュールを渡す
     * VelocityJSがwindow.$を参照しているため、window配下の$とjQueryを参照した場合もjqueryのモジュールを渡す
     *
     */
    new webpack.ProvidePlugin({
      $                : 'jquery',
      jQuery           : 'jquery',
      'window.jQuery'  : 'jquery',
      'window.$'       : 'jquery',
    }),
    new DotEnv({
      path: `./.env`,
      safe: false
    }),
    new WebpackNotifierPlugin({
      title       : 'Webpack',
      alwaysNotify: true
    })
  ]
};

module.exports = config;

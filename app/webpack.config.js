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
    path    : `${__dirname}/js`,
    filename: '[name].bundle.js'
  },
  /*
   * .map.jsファイルを出力(デバッグ用)
   */
  devtool: 'inline-source-map',
  /*
   * electron用にBundleする設定、パスの指定方法
   */
  target : 'electron',
  node   : {
    __dirname : false,
    __filename: false,
  },
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
       * materialize-cssから呼び出すjqueryを一意に固定する
       */
      jquery: path.join(__dirname, 'node_modules', 'jquery'),
    }
  },
  plugins: [
    /*
     * materialize-cssがjqueryに依存している
     * $またはjQueryが呼び出されたらjqueryのモジュールを渡す
     * VelocityJSがwindow.$を参照しているため、window配下の$とjQueryも巻き取る
     */
    new webpack.ProvidePlugin({
      $              : "jquery",
      jQuery         : "jquery",
      "window.jQuery": "jquery",
      "window.$"     : "jquery"
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

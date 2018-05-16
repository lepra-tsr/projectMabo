import path from 'path';

const entryPoint = path.resolve(__dirname, 'views');
const distribute = path.resolve(__dirname, 'public');

/*
 * ./
 *  |- src
 *  |   |- client
 *  |   |   |- class //---------- webpack targets.js
 *  |   |   |   |- class.js
 *  |   |   |   `- class.js
 *  |   |   `- components //----- webpack targets.jsx
 *  |   |       |- components.jsx
 *  |   |       `- components.jsx
 *  |   `- api        //--------- webpack ignore
 *  |       |- controller
 *  |       |   |- controller1.js
 *  |       |   `- controller2.js
 *  |       `- util.js
 *  |- views
 *  |   `- index.jsx  //--------- entryPoint.jsx
 *  `- public
 *      `- bundle.js  //--------- distribute.js
 */
export default {
  mode: 'development',
  entry: {
    client: `${entryPoint}/index.jsx`
  },
  output: {
    path: distribute,
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', { 'modules': false }]
            ]
          }
        }],
        exclude: /(node_modules|src\/api)/,
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: []
};

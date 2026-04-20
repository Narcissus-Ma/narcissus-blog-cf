const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  target: 'webworker',
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
const webpack = require('webpack');
const babel = require('babel-loader');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  context: __dirname,
  entry: ['babel-polyfill', './js/main.js'],
  output: {
    filename: 'main.js',
    sourceMapFilename: '[file].map',
    path: path.join(__dirname, 'compiled'),
    publicPath: 'compiled/',
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/,
        query: { presets: ['es2015', 'react', 'stage-0'] }
      },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: 'css-loader!postcss-loader' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('css-loader!postcss-loader!sass-loader') },
      { test: /\.png$/, loader: 'url-loader?prefix=img/&limit=5000' },
      { test: /\.jpg$/, loader: 'url-loader?prefix=img/&limit=5000' },
      { test: /\.gif$/, loader: 'url-loader?prefix=img/&limit=5000' },
      { test: /\.woff$/, loader: 'url-loader?prefix=font/&limit=5000' },
      { test: /\.woff2$/, loader: 'url-loader?prefix=font/&limit=5000' },
      { test: /\.eot$/, loader: 'file-loader?prefix=font/' },
      { test: /\.ttf$/, loader: 'file-loader?prefix=font/' },
      { test: /\.svg$/, loader: 'file-loader?prefix=font/' },
      { test: /\.txt$/, loader: 'raw-loader' },
    ],
  },
  plugins: [
    new ExtractTextPlugin('../[name].css'),
  ],
};

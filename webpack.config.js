const webpack = require('webpack');
const babel = require('babel-loader');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  context: __dirname,
  entry: './js/main.js',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'compiled'),
    publicPath: 'compiled/',
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel?presets[]=es2015',
      },
      { test: /\.json$/, loader: 'json-loader' },
			{ test: /\.css$/, loader: 'css-loader!postcss-loader' },
			{ test: /\.scss$/, loader: ExtractTextPlugin.extract('css!postcss-loader!sass') },
			{ test: /\.png$/, loader: 'url-loader?prefix=img/&limit=5000' },
			{ test: /\.jpg$/, loader: 'url-loader?prefix=img/&limit=5000' },
			{ test: /\.gif$/, loader: 'url-loader?prefix=img/&limit=5000' },
			{ test: /\.woff$/, loader: 'url-loader?prefix=font/&limit=5000' },
			{ test: /\.woff2$/, loader: 'url-loader?prefix=font/&limit=5000' },
			{ test: /\.eot$/, loader: 'file-loader?prefix=font/' },
			{ test: /\.ttf$/, loader: 'file-loader?prefix=font/' },
			{ test: /\.svg$/, loader: 'file-loader?prefix=font/' },
    ],
  },
  plugins: [
    new ExtractTextPlugin('../[name].css'),
  ],
  postcss: [ autoprefixer({ browsers: '> 5%'}) ],
};

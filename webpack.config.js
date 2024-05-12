const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

// Determine which manifest to use based on an environment variable
const targetBrowser = process.env.TARGET_BROWSER;

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  entry: {
    background: './src/background.ts',
    searchWindow: './src/searchWindow.tsx',
    optionsPane: './src/optionsPane.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/searchWindow.html',
      filename: 'searchWindow.html',
      chunks: ['searchWindow']
    }),
    new HtmlWebpackPlugin({
      template: './public/optionsPane.html',
      filename: 'optionsPane.html',
      chunks: ['optionsPane']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: `public/manifest.${targetBrowser}.json`, to: 'manifest.json' },
        { from: 'public/tabeurator-48.png', to: 'tabeurator-48.png' },
        { from: 'public/tabeurator-96.png', to: 'tabeurator-96.png' },
        { from: 'public/tabeurator-1024.png', to: 'tabeurator-1024.png' }
      ]
    }),
    new webpack.DefinePlugin({
      'process.env.TARGET_BROWSER': JSON.stringify(targetBrowser)
    })
  ]
};

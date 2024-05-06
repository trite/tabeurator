const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  // No need to minify a browser extension and it complicates the submission process
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
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/tabeurator-48.png', to: 'tabeurator-48.png' },
        { from: 'public/tabeurator-96.png', to: 'tabeurator-96.png' },
        { from: 'public/tabeurator-1024.png', to: 'tabeurator-1024.png' }
      ],
    })
  ]
};
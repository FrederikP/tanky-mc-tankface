const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const distPath = path.resolve(__dirname, 'dist')

module.exports = {
  entry: './src/main.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: distPath
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  devServer: {
    contentBase: distPath,
    compress: true,
    port: 9000
  }
};
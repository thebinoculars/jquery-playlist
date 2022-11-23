require('dotenv').config()
const path = require('path')
const { DefinePlugin, ProvidePlugin } = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
require('dotenv').config()

module.exports = {
  entry: [
    path.resolve(__dirname, '../src/app.js'),
    path.resolve(__dirname, '../src/app.scss'),
  ],

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].[hash].js',
    publicPath: '/',
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Webpack',
      template: path.resolve(__dirname, '../src/app.pug'),
      filename: 'index.html',
      favicon: path.resolve(__dirname, '../src/favicon.ico'),
    }),
    new ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new DefinePlugin({
      "process.env": JSON.stringify(process.env)
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ]
      },
      {
        test: /\.(ico|gif|png|jpg|jpeg|webp|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          context: 'src',
        },
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|)$/,
        loader: 'file-loader',
        options: {
          limit: 8192,
          name: '[path][name].[ext]',
          context: 'src',
        },
      },
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: 'jQuery'
          }, {
            loader: 'expose-loader',
            options: '$'
          }
        ]
      }
    ],
  },
}
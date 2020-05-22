const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDev = process.env.NODE_ENV === 'development'

const config = {
  target: 'web',
  entry: path.join(__dirname, 'src/index.js'),
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isDev ? '"development"' : '"production"'
      }
    }),
    new VueLoaderPlugin(),
    new HtmlPlugin()
  ],
  resolve: {
    extensions: ['.vue', '.js', '.jsx']
  },
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, 'dist')
  }
}

if (isDev) {
  config.mode = 'development'
  config.module.rules.push({
    test: /\.styl/,
    use: [
      'style-loader',
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true
        }
      },
      'stylus-loader'
    ]
  })
  config.devtool = 'eval-cheap-module-source-map',
    config.devServer = {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 8000,
      host: '0.0.0.0',
      overlay: {
        errors: true
      },
      // open: true,
      hot: true,
      historyApiFallback: true
    }
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
} else {
  config.mode = 'production'
  config.output.filename = '[name].[chunkhash:8].js'
  config.module.rules.push({
    test: /\.styl/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
        },
      },
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true
        }
      },
      'stylus-loader'
    ]
  })
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css'
    })
  )
  config.optimization = {
    splitChunks: {
      cacheGroups: {
        vendors: {
          chunks: 'all',
          test: /(vue|vuex|vue-router)/,
          priority: 100,
          name: function (module, chunks, cacheGroupKey) {
            return cacheGroupKey
          }
        },
        asyncCommons: {
          chunks: 'async',
          minChunks: 2,
          priority: 90,
          name: function (module, chunks, cacheGroupKey) {
            return cacheGroupKey
          }
        },
        defaultVendors: {
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: function (module, chunks, cacheGroupKey) {
            return cacheGroupKey
          }
        },
        default: {
          chunks: 'all',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  }
}

module.exports = config

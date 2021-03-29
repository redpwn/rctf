const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const PrefreshWebpackPlugin = require('@prefresh/webpack')
const SizePlugin = require('size-plugin')

module.exports = () => {
  const env = process.env.NODE_ENV

  return {
    context: path.resolve(__dirname),
    mode: env,
    entry: [
      ...(env === 'development' ? ['./lib/preact-debug-entry'] : []),
      './src/index',
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename:
        env === 'development'
          ? 'assets/[name].js'
          : 'assets/[name].[contenthash].js',
      publicPath: '/',
      clean: true,
    },
    devtool:
      env === 'development' ? 'eval-cheap-module-source-map' : 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: 'lib/index.html',
        scriptLoading: 'defer',
        inject: 'body',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/static',
            to: '.',
          },
        ],
      }),
      new webpack.EnvironmentPlugin({
        NODE_ENV: env,
      }),
      new ESLintPlugin({
        extensions: ['js', 'jsx', 'ts', 'tsx'],
      }),
      new ForkTsCheckerWebpackPlugin(),
      ...(env === 'development'
        ? [
            new PrefreshWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin(),
          ]
        : [
            new SizePlugin({
              writeFile: false,
            }),
          ]),
    ],
    optimization: {
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: { output: { comments: false } },
          extractComments: false,
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins:
                  env === 'development' ? ['@prefresh/babel-plugin'] : [],
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.wasm', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
    devServer: {
      host: '0.0.0.0',
      disableHostCheck: true,
      overlay: {
        errors: true,
        warnings: true,
      },
      hot: true,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
        },
        '/uploads': {
          target: 'http://localhost:3000',
        },
      },
    },
  }
}

/* eslint-env node */
'use strict';
const {basename, join} = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const cssnext = require('postcss-cssnext');


/**
 * @param {String[]} extensions
 */
function getRegex(extensions){
	return new RegExp('\\.(' + extensions.join('|') + ')$'); // eslint-disable-line prefer-template
}

/**
 * @typedef GetConfigOptions
 * @property {Object} entry Webpack entries
 * @property {Boolean} minify `true` to minify CSS/JS and use SRI hashes, `false` otherwise
 * @property {Number} port Port for Webpack Dev Server
 * @property {String} outputFolder Absolute path to the folder where files are emitted
 * @property {String} rootFolder Absolute path to the rroot context folder
 * @property {Object} cssVariables CSS Variables, e.g. `{themeBackground: 'rebeccapurple'}`
 * @property {String[]} browsers Target browsers for CSS Autoprefixer
 * @property {String[]} copyAssets File extensions of files to just copy as-is
 * @property {String[]} embedAssets File extensions of files to embed as base64 (if small enough) or just copy as-is (if large)
 * @property {String[]} embedLimit Filesize limit to embed assets
 */

/**
 * Generates a Webpack 4 config for Web apps.
 * @param {GetConfigOptions} options
 * @returns {Object}
 */
module.exports = function getConfig({
	entry = {application: './src/index.ts'},
	rootFolder = '',
	outputFolder = '',
	minify = true,
	port = 8000,
	cssVariables = {},
	browsers = ['last 2 versions', 'ie >= 11'],
	embedAssets = ['jpg', 'png', 'gif', 'svg'],
	copyAssets = ['woff'],
	embedLimit = 5000
} = {}){
	const loaders = [
		//region Typescript
		{
			enforce: 'pre',
			test: /\.(ts|js)?$/,
			use: 'source-map-loader'
		},
		{
			test: /\.(ts|js)$/,
			use: [
				{
					loader: 'ts-loader',
					options: {
						transpileOnly: true
					}
				}
			]
		},
		//endregion
		//region CSS
		{
			test: /\.css$/,
			use: [
				MiniCssExtractPlugin.loader,
				{
					loader: 'css-loader',
					options: {
						modules: true
					}
				},
				{
					loader: 'postcss-loader',
					options: {
						plugins: [
							cssnext({
								browsers,
								features: {
									customProperties: {
										variables: cssVariables
									}
								}
							})
						]
					}
				}
			]
		}
		//endregion
	];
	//region Images
	if (embedAssets.length > 0){
		loaders.push({
			test: getRegex(embedAssets),
			use: {
				loader: 'url-loader',
				options: {
					limit: embedLimit,
					name: minify ? 'assets/[hash].[name].[ext]' : 'assets/[name].[ext]'
				}
			}
		});
	}
	//endregion
	//region Other assets
	if (copyAssets.length > 0){
		loaders.push({
			test: getRegex(copyAssets),
			use: {
				loader: 'url-loader',
				options: {
					limit: 0,
					name: minify ? 'assets/[hash].[name].[ext]' : 'assets/[name].[ext]'
				}
			}
		});
	}
	//endregion
	return {
		//region Input
		target: 'web',
		devtool: 'source-map',
		resolve: {
			extensions: ['.ts', '.js']
		},
		context: rootFolder,
		entry,
		//endregion
		//region Output
		output: {
			path: outputFolder,
			publicPath: '/',
			crossOriginLoading: 'anonymous',
			filename: minify ? '[hash].[name].js' : '[name].js',
			chunkFilename: minify ? '[hash].chunk.[id].js' : 'chunk.[id].js'
		},
		//endregion
		//region Dev Server
		devServer: {
			port,
			compress: true,
			contentBase: outputFolder,
			publicPath: '/',
			historyApiFallback: false,
			clientLogLevel: 'none',
			stats: 'errors-only'
		},
		//endregion
		//region Plugins
		plugins: [
			new CleanWebpackPlugin([
				basename(outputFolder)
			], {
				root: join(outputFolder, '..'),
				verbose: false
			}),
			new MiniCssExtractPlugin({
				filename: minify ? '[hash].[name].css' : '[name].css',
				chunkFilename: '[id].css'
			}),
			new HtmlWebpackPlugin({
				hash: true,
				filename: 'index.html'
			}),
			new SriPlugin({
				hashFuncNames: ['sha256', 'sha384'],
				enabled: minify
			})
		],
		//endregion
		//region Loaders
		module: {
			rules: loaders
		}
		//endregion
	};
};

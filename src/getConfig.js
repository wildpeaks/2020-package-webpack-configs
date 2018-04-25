/* eslint-env node */
'use strict';
const {strictEqual} = require('assert');
const {basename, join, isAbsolute} = require('path');
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
 * @property {String} rootFolder Absolute path to the rroot context folder
 * @property {String} outputFolder Absolute path to the folder where files are emitted
 * @property {String} publicPath Path prepended to url references, e.g. `/` or `/mysite/`
 * @property {Boolean} minify `true` to minify CSS/JS and use SRI hashes, `false` otherwise
 * @property {Number} port Port for Webpack Dev Server
 * @property {Object} cssVariables CSS Variables, e.g. `{themeBackground: 'rebeccapurple'}`
 * @property {String[]} browsers Target browsers for CSS Autoprefixer
 * @property {String[]} embedLimit Filesize limit to embed assets
 * @property {String[]} embedExtensions File extensions of files to embed as base64 (if small enough) or just copy as-is (if large)
 * @property {String[]} copyExtensions File extensions of files to just copy as-is
 * @property {String} assetsRelativePath File extensions of files to just copy as-is
 * @property {Boolean} sourcemaps `true` to generate sourcemaps for scripts & stylesheets, `false` to skip them
 * @property {Boolean} skipPostprocess `true` for the lightweight config (for tests), `false` for the whole config
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
	publicPath = '/',
	minify = true,
	port = 8000,
	cssVariables = {},
	browsers = ['>0.25%', 'ie >= 11'],
	embedLimit = 5000,
	embedExtensions = ['jpg', 'png', 'gif', 'svg'],
	copyExtensions = ['woff'],
	assetsRelativePath = 'assets/',
	sourcemaps = true,
	skipPostprocess = false
} = {}){
	strictEqual(entry === null, false, '"entry" should not be null');
	strictEqual(typeof entry, 'object', '"entry" should be an Object');
	strictEqual(typeof rootFolder, 'string', '"rootFolder" should be a String');
	strictEqual(typeof outputFolder, 'string', '"outputFolder" should be a String');
	strictEqual(typeof publicPath, 'string', '"publicPath" should be a String');
	strictEqual(typeof minify, 'boolean', '"minify" should be a Boolean');
	strictEqual(typeof port, 'number', '"port" should be a Number');
	strictEqual(isNaN(port), false, '"port" must not be NaN');
	strictEqual(port > 0, true, '"port" should be a positive number');
	strictEqual(cssVariables === null, false, '"cssVariables" should not be null');
	strictEqual(typeof cssVariables, 'object', '"cssVariables" should be an Object');
	strictEqual(Array.isArray(browsers), true, '"browsers" should be an Array');
	strictEqual(browsers.length > 0, true, '"browsers" should not be empty');
	strictEqual(typeof embedLimit, 'number', '"embedLimit" should be a Number');
	strictEqual(isNaN(embedLimit), false, '"embedLimit" must not be NaN');
	strictEqual(Array.isArray(embedExtensions), true, '"embedExtensions" should be an Array');
	strictEqual(Array.isArray(copyExtensions), true, '"copyExtensions" should be an Array');
	strictEqual(typeof assetsRelativePath, 'string', '"assetsRelativePath" should be a String');
	strictEqual(typeof sourcemaps, 'boolean', '"sourcemaps" should be a Boolean');
	strictEqual(typeof skipPostprocess, 'boolean', '"skipPostprocess" should be a Boolean');
	if (!isAbsolute(rootFolder)){
		throw new Error('"rootFolder" should be an absolute path');
	}
	if (!skipPostprocess && !isAbsolute(outputFolder)){
		throw new Error('"outputFolder" should be an absolute path');
	}
	if ((assetsRelativePath !== '') && !assetsRelativePath.endsWith('/')){
		throw new Error('"assetsRelativePath" must end with "/" when not empty');
	}

	const loaders = [];
	const plugins = [];
	//region Base Config
	const config = {
		//region Input
		target: 'web',
		devtool: sourcemaps ? 'source-map' : false,
		mode: minify ? 'production' : 'development',
		resolve: {
			extensions: ['.ts', '.js']
		},
		context: rootFolder,
		entry,
		//endregion
		//region Output
		output: {
			path: outputFolder,
			publicPath,
			filename: minify ? '[hash].[name].js' : '[name].js',
			chunkFilename: minify ? '[hash].chunk.[id].js' : 'chunk.[id].js'
		}
		//endregion
	};
	//endregion

	//region Minification
	if (!skipPostprocess){
		config.optimization = {
			minimize: minify,
			nodeEnv: minify ? 'production' : 'development',
			concatenateModules: true
		};
	}
	//endregion

	//region Reset the output
	if (!skipPostprocess){
		plugins.push(
			new CleanWebpackPlugin([
				basename(outputFolder)
			], {
				root: join(outputFolder, '..'),
				verbose: false
			})
		);
	}
	//endregion

	//region HTML
	if (!skipPostprocess){
		const ids = Object.keys(entry);
		if (ids.length === 1){
			plugins.push(
				new HtmlWebpackPlugin({
					hash: !minify,
					filename: 'index.html'
				})
			);
		} else {
			ids.forEach(entryId => {
				plugins.push(
					new HtmlWebpackPlugin({
						hash: !minify,
						chunks: [entryId],
						filename: `${entryId}.html`
					})
				);
			});
		}
		//endregion
	}
	//endregion

	//region Subressource Integrity
	if (!skipPostprocess){
		config.output.crossOriginLoading = 'anonymous';
		plugins.push(
			new SriPlugin({
				hashFuncNames: ['sha256', 'sha384'],
				enabled: minify
			})
		);
	}
	//endregion

	//region Typescript
	if (sourcemaps){
		loaders.push({
			enforce: 'pre',
			test: /\.(ts|js)?$/,
			use: 'source-map-loader'
		});
	}
	loaders.push({
		test: /\.(ts|js)$/,
		use: [
			{
				loader: 'ts-loader',
				options: {
					transpileOnly: true
				}
			}
		]
	});
	//endregion

	//region CSS
	loaders.push({
		test: /\.css$/,
		use: [
			MiniCssExtractPlugin.loader,
			{
				loader: 'css-loader',
				options: {
					minimize: minify,
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
	});
	plugins.push(
		new MiniCssExtractPlugin({
			filename: minify ? '[hash].[name].css' : '[name].css',
			chunkFilename: '[id].css'
		})
	);
	//endregion

	//region Images
	if (embedExtensions.length > 0){
		loaders.push({
			test: getRegex(embedExtensions),
			use: {
				loader: 'url-loader',
				options: {
					limit: embedLimit,
					name: minify ? `${assetsRelativePath}[hash].[name].[ext]` : `${assetsRelativePath}[name].[ext]`
				}
			}
		});
	}
	//endregion

	//region Raw assets
	if (copyExtensions.length > 0){
		loaders.push({
			test: getRegex(copyExtensions),
			use: {
				loader: 'file-loader',
				options: {
					name: minify ? `${assetsRelativePath}[hash].[name].[ext]` : `${assetsRelativePath}[name].[ext]`
				}
			}
		});
	}
	//endregion

	//region Dev Server
	if (!skipPostprocess){
		config.devServer = {
			port,
			compress: true,
			contentBase: outputFolder,
			publicPath,
			historyApiFallback: false,
			clientLogLevel: 'none',
			stats: 'errors-only'
		};
	}
	//endregion

	config.plugins = plugins;
	config.module = {
		rules: loaders
	};
	return config;
};

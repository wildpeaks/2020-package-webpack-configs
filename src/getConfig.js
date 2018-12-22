/* eslint-env node */
/* eslint-disable max-statements */
'use strict';
const {strictEqual} = require('assert');
const {basename, join, isAbsolute} = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const cssnano = require('cssnano');
const templateFilepath = join(__dirname, 'template.html');


/**
 * @param {String[]} extensions
 */
function getRegex(extensions){
	return new RegExp('\\.(' + extensions.join('|') + ')$'); // eslint-disable-line prefer-template
}


/**
 * @typedef GetConfigOptions
 * @property {Object} entry Webpack entries
 * @property {Object[]} pages List of HTML pages to output
 * @property {String} rootFolder Absolute path to the root context folder
 * @property {String} outputFolder Absolute path to the folder where files are emitted
 * @property {String} publicPath Path prepended to url references, e.g. `/` or `/mysite/`
 * @property {String} mode Use `production` to optimize the output, `development` for faster builds
 * @property {Number} port Port for Webpack Dev Server
 * @property {Boolean} cssModules Enables CSS Modules
 * @property {String} scss Arbitrary SCSS code prepended to every .css and .scss file. Useful for setting variables.
 * @property {String[]} browsers Target browsers for CSS Autoprefixer
 * @property {String[]} embedLimit Filesize limit to embed assets
 * @property {String[]} embedExtensions File extensions of files to embed as base64 (if small enough) or just copy as-is (if large)
 * @property {String[]} rawExtensions File extensions of files to load as raw string
 * @property {String[]} copyExtensions File extensions of files to just copy as-is
 * @property {Object[]} copyPatterns Files and directories to copy as-is, without having to reference them in the code
 * @property {Object[]} injectPatterns Additional scripts and stylesheets to inject in HTML
 * @property {String} assetsRelativePath File extensions of files to just copy as-is
 * @property {Boolean} sourcemaps `true` to generate sourcemaps for scripts & stylesheets, `false` to skip them
 * @property {Boolean} skipPostprocess `true` for the lightweight config (for tests), `false` for the whole config
 * @property {String[]} polyfills List of modules or files to automatically prepend to every entry
 * @property {String[]} webworkerPolyfills List of modules or files to automatically prepend to every webworker
 * @property {RegExp} webworkerPattern RegExp test for the Web Worker loader
 * @property {Boolean} skipHashes If `true`, it will not add `[hash]` in filenames in production mode.
 */

/**
 * Generates a Webpack 4 config for Web apps.
 * @param {GetConfigOptions} options
 * @returns {Object}
 */
module.exports = function getConfig({
	entry = {application: './src/index.ts'},
	pages = [{title: 'Index', filename: 'index.html'}],
	rootFolder = '',
	outputFolder = '',
	publicPath = '/',
	mode = 'production',
	port = 8000,
	cssModules = true,
	scss = '',
	browsers = ['>0.25%', 'ie >= 11'],
	embedLimit = 5000,
	embedExtensions = ['jpg', 'png', 'gif', 'svg'],
	rawExtensions = ['txt'],
	copyExtensions = ['woff'],
	copyPatterns = [],
	injectPatterns = [],
	assetsRelativePath = 'assets/',
	sourcemaps = true,
	skipPostprocess = false,
	polyfills = ['core-js/fn/promise'],
	webworkerPolyfills = ['core-js/fn/promise'],
	webworkerPattern = /\.webworker\.ts$/,
	skipHashes = false
} = {}){
	strictEqual(typeof rootFolder, 'string', '"rootFolder" should be a String');
	let actualRootFolder = rootFolder;
	if (actualRootFolder === ''){
		actualRootFolder = process.cwd();
	} else if (!isAbsolute(actualRootFolder)){
		throw new Error('"rootFolder" should be an absolute path');
	}

	strictEqual(typeof outputFolder, 'string', '"outputFolder" should be a String');
	let actualOutputFolder = outputFolder;
	if (!skipPostprocess){
		if (actualOutputFolder === ''){
			actualOutputFolder = join(actualRootFolder, 'dist');
		} else if (!isAbsolute(actualOutputFolder)){
			throw new Error('"outputFolder" should be an absolute path');
		}
	}

	strictEqual(typeof mode, 'string', '"mode" should be a String');
	if (mode === ''){
		throw new Error('"mode" should not be empty');
	}

	strictEqual(entry === null, false, '"entry" should not be null');
	strictEqual(Array.isArray(entry), false, '"entry" should not be an Array');
	strictEqual(entry instanceof Promise, false, '"entry" should not be a Promise');
	strictEqual(entry instanceof RegExp, false, '"entry" should not be a RegExp');
	strictEqual(entry instanceof Symbol, false, '"entry" should not be a Symbol');
	strictEqual(typeof entry, 'object', '"entry" should be an Object');

	strictEqual(Array.isArray(pages), true, '"pages" should be an Array');

	strictEqual(typeof port, 'number', '"port" should be a Number');
	strictEqual(isNaN(port), false, '"port" must not be NaN');
	strictEqual(port > 0, true, '"port" should be a positive number');

	strictEqual(typeof cssModules, 'boolean', '"cssModules" should be a Boolean');
	strictEqual(typeof scss, 'string', '"scss" should be a String');

	strictEqual(Array.isArray(browsers), true, '"browsers" should be an Array');
	strictEqual(browsers.length > 0, true, '"browsers" should not be empty');

	strictEqual(typeof embedLimit, 'number', '"embedLimit" should be a Number');
	strictEqual(isNaN(embedLimit), false, '"embedLimit" must not be NaN');

	strictEqual(Array.isArray(embedExtensions), true, '"embedExtensions" should be an Array');
	strictEqual(Array.isArray(rawExtensions), true, '"rawExtensions" should be an Array');
	strictEqual(Array.isArray(copyExtensions), true, '"copyExtensions" should be an Array');
	strictEqual(Array.isArray(copyPatterns), true, '"copyPatterns" should be an Array');
	strictEqual(Array.isArray(injectPatterns), true, '"injectPatterns" should be an Array');

	strictEqual(typeof publicPath, 'string', '"publicPath" should be a String');
	strictEqual(typeof sourcemaps, 'boolean', '"sourcemaps" should be a Boolean');
	strictEqual(typeof skipPostprocess, 'boolean', '"skipPostprocess" should be a Boolean');
	strictEqual(Array.isArray(polyfills), true, '"polyfills" should be an Array');
	strictEqual(Array.isArray(webworkerPolyfills), true, '"webworkerPolyfills" should be an Array');
	strictEqual(typeof skipHashes, 'boolean', '"webworkerPolyfills" should be a Boolean');

	strictEqual(typeof assetsRelativePath, 'string', '"assetsRelativePath" should be a String');
	if ((assetsRelativePath !== '') && !assetsRelativePath.endsWith('/')){
		throw new Error('"assetsRelativePath" must end with "/" when not empty');
	}

	if (!(webworkerPattern instanceof RegExp)){
		throw new Error('"webworkerPattern" should be a RegExp');
	}

	//region Polyfills
	const entries = {};
	for (const key in entry){
		const filepath = entry[key];
		entries[key] = polyfills.concat(Array.isArray(filepath) ? filepath : [filepath]);
	}
	//endregion

	const minify = (mode === 'production');
	const loaders = [];
	const plugins = [];
	//region Base Config
	const config = {
		//region Input
		target: 'web',
		devtool: sourcemaps ? 'source-map' : false,
		mode,
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx']
		},
		context: actualRootFolder,
		entry: entries,
		//endregion
		//region Output
		output: {
			path: actualOutputFolder,
			pathinfo: false,
			publicPath,
			filename: (minify && !skipHashes) ? '[hash].[name].js' : '[name].js',
			chunkFilename: (minify && !skipHashes) ? '[hash].chunk.[id].js' : 'chunk.[id].js'
		},
		//endregion
		//region Hints
		performance: {
			hints: false
		}
		//endregion
	};
	//endregion

	//region Minification
	if (!skipPostprocess){
		config.optimization = {
			minimize: minify,
			nodeEnv: mode,
			concatenateModules: true
		};
	}
	//endregion

	//region Reset the output
	if (!skipPostprocess){
		plugins.push(
			new CleanWebpackPlugin([
				basename(actualOutputFolder)
			], {
				root: join(actualOutputFolder, '..'),
				verbose: false
			})
		);
	}
	//endregion

	//region HTML
	if (!skipPostprocess){
		if (pages.length > 0){
			for (const page of pages){
				if ((page === null) || (typeof page !== 'object')){
					if (typeof page.minify === 'undefined'){
						page.minify = minify;
					}
					if (typeof page.template === 'undefined'){
						page.template = templateFilepath;
					}
					if (typeof page.lang === 'undefined'){
						page.lang = 'en';
					}
					if (typeof page.viewport === 'undefined'){
						page.viewport = 'width=device-width, initial-scale=1.0';
					}
				}
				plugins.push(
					new HtmlWebpackPlugin(page)
				);
			}
		}
		//endregion
	}
	//endregion

	//region Subressource Integrity
	if (!skipPostprocess && !skipHashes){
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
			test: /\.(ts|tsx|js|jsx)?$/,
			use: 'source-map-loader'
		});
	}
	loaders.push({
		enforce: 'pre',
		test: webworkerPattern,
		use: [
			{
				loader: join(__dirname, 'polyfills.loader.js'),
				options: {
					polyfills: webworkerPolyfills
				}
			}
		]
	});
	loaders.push({
		test: webworkerPattern,
		use: [
			{
				loader: 'ts-loader',
				options: {
					transpileOnly: true,

					// https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15
					experimentalWatchApi: true
				}
			},
			{
				loader: 'worker-loader',
				options: {
					inline: false,
					name: (minify && !skipHashes) ? '[hash].[name].js' : '[name].js'
				}
			}
		]
	});
	loaders.push({
		test: /\.(ts|tsx|js|jsx)$/,
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
	const postcssPlugins = [
		postcssPresetEnv({browsers})
	];
	if (!skipPostprocess && minify){
		postcssPlugins.push(
			cssnano({
				preset: ['default', {
					discardComments: {
						removeAll: true
					}
				}]
			})
		);
	}
	const cssLoaders = [
		MiniCssExtractPlugin.loader,
		{
			loader: 'css-loader',
			options: {
				modules: cssModules
			}
		},
		{
			loader: 'postcss-loader',
			options: {
				ident: 'postcss',
				plugins: postcssPlugins
			}
		}
	];

	if (scss !== ''){
		cssLoaders.push({
			loader: 'sass-loader',
			options: {
				data: scss
			}
		});
	} else {
		cssLoaders.push('sass-loader');
	}
	loaders.push({
		test: /\.(scss|css)$/,
		use: cssLoaders
	});
	plugins.push(
		new MiniCssExtractPlugin({
			filename: (minify && !skipHashes) ? '[hash].[name].css' : '[name].css',
			chunkFilename: '[id].css'
		})
	);
	//endregion

	//region Embeddable assets
	if (embedExtensions.length > 0){
		if (embedExtensions.includes('json')){
			loaders.push({
				type: 'javascript/auto',
				test: /\.json$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: embedLimit,
						name: (minify && !skipHashes) ? `${assetsRelativePath}[hash].[name].[ext]` : `${assetsRelativePath}[name].[ext]`
					}
				}
			});
		}
		const embedExtensionsWithoutJson = embedExtensions.filter(ext => ext !== 'json');
		if (embedExtensionsWithoutJson.length > 0){
			loaders.push({
				test: getRegex(embedExtensionsWithoutJson),
				use: {
					loader: 'url-loader',
					options: {
						limit: embedLimit,
						name: (minify && !skipHashes) ? `${assetsRelativePath}[hash].[name].[ext]` : `${assetsRelativePath}[name].[ext]`
					}
				}
			});
		}
	}
	//endregion

	//region Raw assets imported in code
	if (rawExtensions.length > 0){
		loaders.push({
			test: getRegex(rawExtensions),
			use: {
				loader: 'raw-loader'
			}
		});
	}
	//endregion

	//region Assets imported in code
	if (copyExtensions.length > 0){
		if (copyExtensions.includes('json')){
			loaders.push({
				type: 'javascript/auto',
				test: /\.json$/,
				use: {
					loader: 'file-loader',
					options: {
						name: (minify && !skipHashes) ? `${assetsRelativePath}[hash].[name].[ext]` : `${assetsRelativePath}[name].[ext]`
					}
				}
			});
		}
		const copyExtensionsWithoutJson = copyExtensions.filter(ext => ext !== 'json');
		if (copyExtensionsWithoutJson.length > 0){
			loaders.push({
				test: getRegex(copyExtensionsWithoutJson),
				use: {
					loader: 'file-loader',
					options: {
						name: (minify && !skipHashes) ? `${assetsRelativePath}[hash].[name].[ext]` : `${assetsRelativePath}[name].[ext]`
					}
				}
			});
		}
	}
	//endregion

	//region Raw assets indirectly referenced in code
	if (copyPatterns.length > 0){
		plugins.push(
			new CopyWebpackPlugin(copyPatterns, {
				debug: 'warning',
				context: rootFolder
			})
		);
	}
	//endregion

	//region Arbitrary extra scripts & stylesheets
	if (injectPatterns.length > 0){
		for (const injectPattern of injectPatterns){
			plugins.push(
				new HtmlWebpackIncludeAssetsPlugin(injectPattern)
			);
		}
	}
	//endregion

	//region Dev Server
	if (!skipPostprocess){
		config.devServer = {
			port,
			compress: true,
			contentBase: actualOutputFolder,
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

/* eslint-env node */
/* eslint-disable max-statements */
"use strict";
const {strictEqual} = require("assert");
const {join, isAbsolute} = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");


module.exports = function getConfig({
	entry = {application: "./src/index.ts"},
	jsFilename,
	jsChunkFilename,
	rootFolder = "",
	outputFolder = "",
	publicPath = "/",
	mode = "production",
	copyPatterns = [],
	sourcemaps = true,
	skipHashes = false,
	skipReset = false
} = {}) {
	strictEqual(typeof rootFolder, "string", '"rootFolder" should be a String');
	let actualRootFolder = rootFolder;
	if (actualRootFolder === "") {
		actualRootFolder = process.cwd();
	} else if (!isAbsolute(actualRootFolder)) {
		throw new Error('"rootFolder" should be an absolute path');
	}

	strictEqual(typeof outputFolder, "string", '"outputFolder" should be a String');
	let actualOutputFolder = outputFolder;
	if (actualOutputFolder === "") {
		actualOutputFolder = join(actualRootFolder, "dist");
	} else if (!isAbsolute(actualOutputFolder)) {
		throw new Error('"outputFolder" should be an absolute path');
	}

	strictEqual(typeof mode, "string", '"mode" should be a String');
	if (mode === "") {
		throw new Error('"mode" should not be empty');
	}

	strictEqual(entry === null, false, '"entry" should not be null');
	strictEqual(Array.isArray(entry), false, '"entry" should not be an Array');
	strictEqual(entry instanceof Promise, false, '"entry" should not be a Promise');
	strictEqual(entry instanceof RegExp, false, '"entry" should not be a RegExp');
	strictEqual(entry instanceof Symbol, false, '"entry" should not be a Symbol');
	strictEqual(typeof entry, "object", '"entry" should be an Object');

	if (typeof jsFilename !== "string" && typeof jsFilename !== "undefined") {
		throw new Error(`"jsFilename" should be a String or undefined`);
	}
	if (typeof jsChunkFilename !== "string" && typeof jsChunkFilename !== "undefined") {
		throw new Error(`"jsChunkFilename" should be a String or undefined`);
	}

	strictEqual(Array.isArray(copyPatterns), true, '"copyPatterns" should be an Array');

	strictEqual(typeof publicPath, "string", '"publicPath" should be a String');
	strictEqual(typeof sourcemaps, "boolean", '"sourcemaps" should be a Boolean');
	strictEqual(typeof skipHashes, "boolean", '"skipHashes" should be a Boolean');
	strictEqual(typeof skipReset, "boolean", '"skipReset" should be a Boolean');

	const entries = {};
	for (const key in entry) {
		const filepath = entry[key];
		entries[key] = Array.isArray(filepath) ? filepath : [filepath];
	}

	const minify = mode === "production";
	const loaders = [];
	const plugins = [];

	let actualJsFilename = jsFilename;
	if (typeof actualJsFilename !== "string") {
		actualJsFilename = minify && !skipHashes ? "[hash].[name].js" : "[name].js";
	}

	let actualJsChunkFilename = jsChunkFilename;
	if (typeof actualJsChunkFilename !== "string") {
		actualJsChunkFilename = minify && !skipHashes ? "[hash].chunk.[id].js" : "chunk.[id].js";
	}

	const config = {
		target: "node",
		devtool: sourcemaps ? "source-map" : false,
		mode,
		resolve: {
			extensions: [".ts", ".tsx", ".js", ".jsx"]
		},
		context: actualRootFolder,
		entry: entries,
		output: {
			path: actualOutputFolder,
			pathinfo: false,
			publicPath,
			filename: actualJsFilename,
			chunkFilename: actualJsChunkFilename
		},
		performance: {
			hints: false
		}
	};

	config.optimization = {
		minimize: minify,
		nodeEnv: mode,
		concatenateModules: true
	};

	if (!skipReset) {
		plugins.push(
			new CleanWebpackPlugin({
				verbose: false,
				cleanOnceBeforeBuildPatterns: [actualOutputFolder]
			})
		);
	}

	if (sourcemaps) {
		loaders.push({
			enforce: "pre",
			test: /\.(ts|tsx|js|jsx)?$/,
			use: "source-map-loader"
		});
	}
	loaders.push({
		test: /\.(ts|tsx|js|jsx)$/,
		use: [
			{
				loader: "ts-loader",
				options: {
					transpileOnly: true
				}
			}
		]
	});

	if (copyPatterns.length > 0) {
		plugins.push(
			new CopyWebpackPlugin(copyPatterns, {
				debug: "warning",
				context: rootFolder
			})
		);
	}

	config.plugins = plugins;
	config.module = {
		rules: loaders
	};

	config.node = false;
	return config;
};

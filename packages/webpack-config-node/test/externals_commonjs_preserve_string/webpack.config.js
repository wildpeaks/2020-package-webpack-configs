/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	const config = getConfig({
		rootFolder: __dirname,
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-externals-commonjs-preserve-string": "./src/application.ts"
		}
	});
	config.externals = {
		fake1: "commonjs fake1"
	};
	return config;
};

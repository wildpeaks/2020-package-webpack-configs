/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-node");

module.exports = function() {
	const config = getConfig({
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

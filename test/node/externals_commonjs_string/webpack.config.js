/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-node");

module.exports = function() {
	const config = getConfig({
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-externals-commonjs-string": "./src/application.ts"
		}
	});
	config.externals = {
		fake1: "./thirdparty/polyfills.js",
		fake2: "./thirdparty/polyfills.js"
	};
	return config;
};

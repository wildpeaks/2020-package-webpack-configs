/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	const config = getConfig({
		rootFolder: __dirname,
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-externals-relative-array": "./src/application.ts"
		}
	});
	config.externals = {
		fake1: ["./thirdparty/polyfills.js", "dummy1"]
	};
	return config;
};

/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	const config = getConfig({
		rootFolder: __dirname,
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-externals-undefined": "./src/application.ts"
		}
	});
	config.externals = {};
	return config;
};

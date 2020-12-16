/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		entry: {
			"app-sourcemaps": "./src/application.ts"
		},
		sourcemaps: true
	});
};

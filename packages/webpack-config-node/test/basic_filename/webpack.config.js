/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-basic-filename": "./src/application.ts"
		},
		jsFilename: "subfolder/custom.[name].js"
	});
};

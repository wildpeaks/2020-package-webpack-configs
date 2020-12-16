/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-basic-filename": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-basic-filename"]
			}
		],
		jsFilename: "subfolder/custom.[name].js"
	});
};

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
			"app-assets": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-assets"]
			}
		],
		embedLimit: 5000,
		embedExtensions: ["jpg", "png"],
		copyExtensions: ["gif", "json"],
		assetFilename: "myimages/[name].[ext]"
	});
};

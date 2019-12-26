/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
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

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
			"app-css-modules-filename": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-css-modules-filename"]
			}
		],
		cssModules: true,
		cssFilename: "subfolder/custom.[name].css"
	});
};

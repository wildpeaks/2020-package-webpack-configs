/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-scss-global-import": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-scss-global-import"]
			}
		],
		scss: '@import "variables.scss";',
		polyfills: ["./src/reset.scss"]
	});
};

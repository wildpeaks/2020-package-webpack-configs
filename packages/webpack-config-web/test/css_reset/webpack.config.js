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
			"app-css-reset": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-css-reset"]
			}
		],
		polyfills: ["./src/reset.css"]
	});
};

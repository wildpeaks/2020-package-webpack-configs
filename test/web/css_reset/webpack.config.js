/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
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

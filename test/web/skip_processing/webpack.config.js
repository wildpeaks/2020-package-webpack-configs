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
			"app-skip-postprocessing": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-skip-postprocessing"]
			}
		],
		skipPostprocess: true
	});
};

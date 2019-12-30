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
			"app-scss-chunks-variables": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-scss-chunks-variables"]
			}
		],
		cssModules: true,
		scss: `
			$color1: rgb(0, 128, 0);
			$color2: rgb(0, 0, 128);
		`
	});
};

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
			"app-multiple-1": "./src/application-1.ts",
			"app-multiple-2": "./src/application-2.ts",
			"app-multiple-3": "./src/application-3.ts"
		},
		pages: [
			{
				filename: "app1.html",
				chunks: ["app-multiple-1"]
			},
			{
				filename: "app2.html",
				chunks: ["app-multiple-2"]
			},
			{
				filename: "app3.html",
				chunks: ["app-multiple-3"]
			}
		]
	});
};

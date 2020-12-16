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
			"app-scss-global-define": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-scss-global-define"]
			}
		],
		scss: "$mycolor: rgb(128, 128, 0);",
		polyfills: ["./src/reset.scss"]
	});
};

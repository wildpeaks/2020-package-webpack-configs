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
			"app-scss-chunks-filename": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-scss-chunks-filename"]
			}
		],
		cssModules: true,
		cssChunkFilename: "subfolder/custom.chunk.[id].css"
	});
};

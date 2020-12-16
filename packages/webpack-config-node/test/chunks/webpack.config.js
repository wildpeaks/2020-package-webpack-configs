/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-chunks": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-chunks"]
			}
		]
	});
};

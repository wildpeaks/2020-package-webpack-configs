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
			"app-copy-patterns": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-copy-patterns"]
			}
		],
		copyPatterns: [
			// Without "**", "from" is the context:
			{from: "src/myfolder-1", to: "copied-1"},
			{from: "src/myfolder-1", to: "copied-2/"},
			{from: "src/myfolder-1", to: "copied-3", toType: "dir"},
			{from: "src/myfolder-1", to: "copied-4/subfolder"},

			// With "**", it copies using the whole path (hence creates a "myfolder-2" folder in output).
			// Use "context" to make it use only the end of the path.
			{from: "src/myfolder-2/**/*.example-1", to: "copied-5"},
			{from: "**/*.example-1", to: "copied-6", context: "src/myfolder-2"},

			// File-looking folder name
			{from: "src/myfolder-3.ext", to: "copied-7"},

			// Folder-looking filename
			{from: "src/file9", to: "copied-8"}
		]
	});
};

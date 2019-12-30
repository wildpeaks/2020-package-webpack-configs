/* eslint-env node */
"use strict";
const {join} = require("path");
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-pages-1": "./src/first.ts",
			"app-pages-2": "./src/second.ts"
		},
		pages: [
			{
				title: "One",
				filename: "page1.html",
				chunks: ["app-pages-1"]
			},
			{
				title: "Two",
				filename: "page2.html",
				chunks: ["app-pages-2"]
			},
			{
				title: "Three",
				filename: "page3.html"
			},
			{
				title: "Four",
				filename: "subfolder/page4.html"
			},
			{
				title: "Five",
				filename: "page5.html",
				meta: [{param1: "Value 1"}, {param2: "Value 2"}]
			},
			{
				title: "Six",
				filename: "page6.html",
				example: "AAAAA",
				template: join(__dirname, "src/template.html")
			}
		]
	});
};

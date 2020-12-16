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
			"app-inject": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-inject"]
			}
		],
		publicPath: "/mypublic/",
		assetFilename: "myassets/[name].[ext]",
		injectPatterns: [
			{
				append: false,
				tags: ["thirdparty/three.min.js", "thirdparty/OrbitControls.js"]
			},
			{
				append: true,
				tags: ["override-styles-1.css"]
			},
			{
				append: true,
				publicPath: false,
				tags: ["override-styles-2.css"]
			},
			{
				append: true,
				publicPath: "custom/",
				tags: ["override-styles-3.css"]
			},
			{
				append: false,
				publicPath: false,
				tags: [
					{
						type: "css",
						path: "http://example.com/stylesheet",
						attributes: {
							hello: "example css"
						}
					},
					{
						type: "js",
						path: "http://example.com/script",
						attributes: {
							hello: "example js"
						}
					}
				]
			}
		]
	});
};

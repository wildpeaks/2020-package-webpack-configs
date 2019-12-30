/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-node");

module.exports = function() {
	return getConfig({
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-require-fs": "./src/application.ts"
		}
	});
};

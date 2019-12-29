/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-node");

module.exports = function() {
	return getConfig({
		mode: "development",
		entry: {
			"app-sourcemaps": "./src/application.ts"
		},
		sourcemaps: true
	});
};

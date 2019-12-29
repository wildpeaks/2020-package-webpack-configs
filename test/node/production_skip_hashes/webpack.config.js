/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-node");

module.exports = function() {
	return getConfig({
		mode: "production",
		sourcemaps: false,
		entry: {
			"app-production-skip-hashes": "./src/application.ts"
		},
		skipHashes: true
	});
};

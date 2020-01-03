/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-node");

module.exports = function() {
	const config = getConfig({
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-externals-globals": "./src/application.ts"
		}
	});
	config.externals = {
		fake1: "FAKE_1",
		fake2: "global.FAKE_2"
	};
	return config;
};

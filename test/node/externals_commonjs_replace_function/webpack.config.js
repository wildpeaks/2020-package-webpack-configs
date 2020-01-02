/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-node");

module.exports = function() {
	const config = getConfig({
		mode: "development",
		sourcemaps: false,
		entry: {
			"app-externals-commonjs-replace-function": "./src/application.ts"
		}
	});
	config.externals = [
		function(_context, request, done) {
			if (request === "fake1") {
				done(null, "commonjs fake2");
				return;
			}
			done();
		}
	];
	return config;
};

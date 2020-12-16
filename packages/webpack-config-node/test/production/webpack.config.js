/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "production",
		sourcemaps: false,
		entry: {
			"app-production": "./src/application.ts"
		}
	});
};

/* eslint-env node */
"use strict";
const {getOptions} = require("loader-utils");

module.exports = function (source) {
	this.cacheable();
	const options = getOptions(this);
	if (options && Array.isArray(options.polyfills)) {
		return options.polyfills.map((polyfill) => `require("${polyfill}");`).join("\n") + source;
	}
	return source;
};

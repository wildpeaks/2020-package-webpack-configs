/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {Boolean} cssModules
 * @param {Boolean} expectThrows
 */
function testFixture(title, cssModules, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				cssModules
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("cssModules", () => {
	testFixture("Valid: true", true, false);
	testFixture("Valid: false", true, false);
	testFixture('Invalid: ""', "", true);
	testFixture('Invalid: "true"', "true", true);
	testFixture('Invalid: "false"', "false", true);
	testFixture("Invalid: 123", 123, true);
	testFixture("Invalid: 0", 0, true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: -1", -1, true);
	testFixture("Invalid: {}", {}, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: Symbol", Symbol("true"), true);
});

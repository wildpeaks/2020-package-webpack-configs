/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../../packages/webpack-config-web");

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

	// It only checks for the data type, not the value inside
	testFixture("Valid: {}", {}, false);
	testFixture('Valid: ""', "", false);
	testFixture('Valid: "true"', "true", false);
	testFixture('Valid: "false"', "false", false);

	testFixture("Invalid: 123", 123, true);
	testFixture("Invalid: 0", 0, true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: -1", -1, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: Symbol", Symbol("true"), true);
});

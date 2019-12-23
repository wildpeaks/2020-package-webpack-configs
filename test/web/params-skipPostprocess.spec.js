/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {Boolean} skipPostprocess
 * @param {Boolean} expectThrows
 * @param {Boolean} useOutputFolder
 */
function testFixture(title, skipPostprocess, expectThrows, useOutputFolder = true) {
	it(title, () => {
		let actualThrows = false;
		try {
			const options = {
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				skipPostprocess
			};
			if (useOutputFolder) {
				options.outputFolder = join(__dirname, "dummy");
			}
			getConfig(options);
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("skipPostprocess", () => {
	testFixture("Valid: true (with outputFolder)", true, false, true);
	testFixture("Valid: true (without outputFolder)", true, false, false);
	testFixture("Valid: false (with outputFolder)", false, false, true);
	testFixture("Valid: false (without outputFolder)", false, false, false);
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

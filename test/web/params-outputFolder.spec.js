/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {String} outputFolder
 * @param {Boolean} expectThrows
 */
function testFixture(title, outputFolder, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				outputFolder,
				rootFolder: __dirname
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("outputFolder", () => {
	testFixture("Valid: __dirname", join(__dirname, "dummy"), false);
	testFixture('Valid: ""', "", false);
	testFixture('Invalid: "myfolder"', "myfolder", true);
	testFixture('Invalid: "./myfolder"', "./myfolder", true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: 123", 123, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: false", false, true);
	testFixture("Invalid: true", true, true);
	testFixture("Invalid: {}", {}, true);
	testFixture("Invalid: Promise", Promise.resolve(), true);
	testFixture("Invalid: Symbol", Symbol("hello"), true);
});

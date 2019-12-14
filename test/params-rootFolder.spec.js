/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {String} rootFolder
 * @param {Boolean} expectThrows
 */
function testFixture(title, rootFolder, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("rootFolder", () => {
	testFixture("Valid: __dirname", __dirname, false);
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

/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfigWeb = require("../../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {String} assetFilename
 * @param {Boolean} expectThrows
 */
function testFixture(title, assetFilename, expectThrows) {
	it(title, () => {
		let actualThrowsWeb = false;
		try {
			getConfigWeb({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				assetFilename
			});
		} catch (e) {
			actualThrowsWeb = true;
		}
		strictEqual(actualThrowsWeb, expectThrows, "Web config");
	});
}

describe("assetFilename", () => {
	testFixture("Valid: undefined", undefined, false);
	testFixture('Valid: ""', "", false);
	testFixture('Valid: "hello"', "hello", false);
	testFixture("Invalid: 123", 123, true);
	testFixture("Invalid: {}", {}, true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: false", false, true);
	testFixture("Invalid: true", true, true);
	testFixture("Invalid: Promise", Promise.resolve(), true);
	testFixture("Invalid: Symbol", Symbol("hello"), true);
});

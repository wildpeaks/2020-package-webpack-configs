/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfigWeb = require("../../packages/webpack-config-web");
const getConfigNode = require("../../packages/webpack-config-node");

/**
 * @param {String} title
 * @param {String} rootFolder
 * @param {Boolean} expectThrows
 */
function testFixture(title, rootFolder, expectThrows) {
	it(title, () => {
		let actualThrowsWeb = false;
		let actualThrowsNode = false;
		try {
			getConfigWeb({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrowsWeb = true;
		}
		try {
			getConfigNode({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrowsNode = true;
		}
		strictEqual(actualThrowsWeb, expectThrows, "Web config");
		strictEqual(actualThrowsNode, expectThrows, "Node config");
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

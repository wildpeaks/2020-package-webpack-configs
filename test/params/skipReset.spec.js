/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfigWeb = require("../../packages/webpack-config-web");
const getConfigNode = require("../../packages/webpack-config-node");

/**
 * @param {String} title
 * @param {Boolean} skipReset
 * @param {Boolean} expectThrows
 */
function testFixture(title, skipReset, expectThrows) {
	it(title, () => {
		let actualThrowsWeb = false;
		let actualThrowsNode = false;
		try {
			getConfigWeb({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				skipReset
			});
		} catch (e) {
			actualThrowsWeb = true;
		}
		try {
			getConfigNode({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				skipReset
			});
		} catch (e) {
			actualThrowsNode = true;
		}
		strictEqual(actualThrowsWeb, expectThrows, "Web config");
		strictEqual(actualThrowsNode, expectThrows, "Node config");
	});
}

describe("skipReset", () => {
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

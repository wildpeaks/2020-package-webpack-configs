/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfigWeb = require("../../packages/webpack-config-web");
const getConfigNode = require("../../packages/webpack-config-node");

/**
 * @param {String} title
 * @param {String} jsFilename
 * @param {Boolean} expectThrows
 */
function testFixture(title, jsFilename, expectThrows) {
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
				jsFilename
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
				jsFilename
			});
		} catch (e) {
			actualThrowsNode = true;
		}
		strictEqual(actualThrowsWeb, expectThrows, "Web config");
		strictEqual(actualThrowsNode, expectThrows, "Node config");
	});
}

describe("jsFilename", () => {
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

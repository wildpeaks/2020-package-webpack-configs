/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfigWeb = require("../../packages/webpack-config-web");
const getConfigNode = require("../../packages/webpack-config-node");

/**
 * @param {String} title
 * @param {String} mode
 * @param {Boolean} expectThrows
 */
function testFixture(title, mode, expectThrows) {
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
				mode
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
				mode
			});
		} catch (e) {
			actualThrowsNode = true;
		}
		strictEqual(actualThrowsWeb, expectThrows, "Web config");
		strictEqual(actualThrowsNode, expectThrows, "Node config");
	});
}

describe("mode", () => {
	testFixture('Valid: "production"', "hello", false);
	testFixture('Valid: "development"', "hello", false);
	testFixture('Valid: "hello"', "hello", false);
	testFixture('Invalid: ""', "", true);
	testFixture("Invalid: true", true, true);
	testFixture("Invalid: false", true, true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: 123", 123, true);
	testFixture("Invalid: {}", {}, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: Promise", Promise.resolve(), true);
	testFixture("Invalid: Symbol", Symbol("hello"), true);
});

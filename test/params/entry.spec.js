/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfigWeb = require("../../packages/webpack-config-web");
const getConfigNode = require("../../packages/webpack-config-node");

/**
 * @param {String} title
 * @param {Object} entry
 * @param {Boolean} expectThrows
 */
function testFixture(title, entry, expectThrows) {
	it(title, () => {
		let actualThrowsWeb = false;
		let actualThrowsNode = false;
		try {
			getConfigWeb({
				entry,
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrowsWeb = true;
		}
		try {
			getConfigNode({
				entry,
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrowsNode = true;
		}
		strictEqual(actualThrowsWeb, expectThrows, "Web config");
		strictEqual(actualThrowsNode, expectThrows, "Node config");
	});
}

describe("entry", () => {
	testFixture("Valid: {}", {}, false);
	testFixture('Valid: {dummy: "./src/dummy.ts"}', {dummy: "./src/dummy.ts"}, false);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: 123", 123, true);
	testFixture('Invalid: ""', "", true);
	testFixture("Invalid: []", [], true);
	testFixture('Invalid: "hello"', "hello", true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: false", false, true);
	testFixture("Invalid: true", true, true);
	testFixture("Invalid: RegExp", /hello/, true);
	testFixture("Invalid: Promise", Promise.resolve(), true);
	testFixture("Invalid: Symbol", Symbol("hello"), true);
});

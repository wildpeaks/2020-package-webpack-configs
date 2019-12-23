/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {String} cssChunkFilename
 * @param {Boolean} expectThrows
 */
function testFixture(title, cssChunkFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				cssChunkFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("cssChunkFilename", () => {
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

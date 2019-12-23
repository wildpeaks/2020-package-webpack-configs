/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {String} mode
 * @param {Boolean} expectThrows
 */
function testFixture(title, mode, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				mode
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
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

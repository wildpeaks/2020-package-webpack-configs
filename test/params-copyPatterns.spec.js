/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {String[]} copyPatterns
 * @param {Boolean} expectThrows
 */
function testFixture(title, copyPatterns, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				copyPatterns
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("copyPatterns", () => {
	testFixture("Valid: []", [], false);
	testFixture("Valid: [{from: 'example/path'}]", [{from: "example/path"}], false);
	testFixture("Invalid: {}", {}, true);
	testFixture("Invalid: 123", 123, true);
	testFixture('Invalid: ""', "", true);
	testFixture('Invalid: "hello"', "hello", true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: false", false, true);
	testFixture("Invalid: true", true, true);
	testFixture("Invalid: Symbol", Symbol("hello"), true);
});

/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {Object[]} injectPatterns
 * @param {Boolean} expectThrows
 */
function testFixture(title, injectPatterns, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				injectPatterns
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("injectPatterns", () => {
	testFixture("Valid: []", [], false);
	testFixture('Valid: [{append: true, assets: "hello.js"}]', [{append: true, assets: "hello.js"}], false);
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

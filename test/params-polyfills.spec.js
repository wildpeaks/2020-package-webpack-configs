/* eslint-env node, mocha */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("../packages/webpack-config-web");

/**
 * @param {String} title
 * @param {String[]} polyfills
 * @param {Boolean} expectThrows
 */
function testFixture(title, polyfills, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				polyfills
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("polyfills", () => {
	testFixture('Valid: ["./hello.js", "world"]', ["./hello.js", "world"], false);
	testFixture("Valid: []", [], false);
	testFixture('Invalid: "./hello.js"', "./hello.js", true);
	testFixture('Invalid: ""', "", true);
	testFixture("Invalid: {}", {}, true);
	testFixture("Invalid: 123", 123, true);
	testFixture('Invalid: "hello"', "hello", true);
	testFixture("Invalid: NaN", NaN, true);
	testFixture("Invalid: null", null, true);
	testFixture("Invalid: false", false, true);
	testFixture("Invalid: true", true, true);
	testFixture("Invalid: Symbol", Symbol("hello"), true);
});

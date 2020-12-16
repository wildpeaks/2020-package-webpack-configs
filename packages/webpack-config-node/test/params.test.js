/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("..");

function test_copyPatterns(title, copyPatterns, expectThrows) {
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
function test_entry(title, entry, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry,
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}
function test_jsChunkFilename(title, jsChunkFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				jsChunkFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}
function test_jsFilename(title, jsFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				jsFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}
function test_mode(title, mode, expectThrows) {
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
function test_outputFolder(title, outputFolder, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				outputFolder,
				rootFolder: __dirname
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}
function test_rootFolder(title, rootFolder, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}
function test_skipHashes(title, skipHashes, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				skipHashes
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}
function test_skipReset(title, skipReset, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				skipReset
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}
function test_sourcemaps(title, sourcemaps, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				sourcemaps
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("Param: copyPatterns", () => {
	test_copyPatterns("Valid: []", [], false);
	test_copyPatterns("Valid: [{from: 'example/path'}]", [{from: "example/path"}], false);
	test_copyPatterns("Invalid: {}", {}, true);
	test_copyPatterns("Invalid: 123", 123, true);
	test_copyPatterns('Invalid: ""', "", true);
	test_copyPatterns('Invalid: "hello"', "hello", true);
	test_copyPatterns("Invalid: NaN", NaN, true);
	test_copyPatterns("Invalid: null", null, true);
	test_copyPatterns("Invalid: false", false, true);
	test_copyPatterns("Invalid: true", true, true);
	test_copyPatterns("Invalid: Symbol", Symbol("hello"), true);
});
describe("Param: entry", () => {
	test_entry("Valid: {}", {}, false);
	test_entry('Valid: {dummy: "./src/dummy.ts"}', {dummy: "./src/dummy.ts"}, false);
	test_entry("Invalid: NaN", NaN, true);
	test_entry("Invalid: 123", 123, true);
	test_entry('Invalid: ""', "", true);
	test_entry("Invalid: []", [], true);
	test_entry('Invalid: "hello"', "hello", true);
	test_entry("Invalid: null", null, true);
	test_entry("Invalid: false", false, true);
	test_entry("Invalid: true", true, true);
	test_entry("Invalid: RegExp", /hello/, true);
	test_entry("Invalid: Promise", Promise.resolve(), true);
	test_entry("Invalid: Symbol", Symbol("hello"), true);
});
describe("Param: jsChunkFilename", () => {
	test_jsChunkFilename("Valid: undefined", undefined, false);
	test_jsChunkFilename('Valid: ""', "", false);
	test_jsChunkFilename('Valid: "hello"', "hello", false);
	test_jsChunkFilename("Invalid: 123", 123, true);
	test_jsChunkFilename("Invalid: {}", {}, true);
	test_jsChunkFilename("Invalid: NaN", NaN, true);
	test_jsChunkFilename("Invalid: null", null, true);
	test_jsChunkFilename("Invalid: false", false, true);
	test_jsChunkFilename("Invalid: true", true, true);
	test_jsChunkFilename("Invalid: Promise", Promise.resolve(), true);
	test_jsChunkFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("Param: jsFilename", () => {
	test_jsFilename("Valid: undefined", undefined, false);
	test_jsFilename('Valid: ""', "", false);
	test_jsFilename('Valid: "hello"', "hello", false);
	test_jsFilename("Invalid: 123", 123, true);
	test_jsFilename("Invalid: {}", {}, true);
	test_jsFilename("Invalid: NaN", NaN, true);
	test_jsFilename("Invalid: null", null, true);
	test_jsFilename("Invalid: false", false, true);
	test_jsFilename("Invalid: true", true, true);
	test_jsFilename("Invalid: Promise", Promise.resolve(), true);
	test_jsFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("Param: mode", () => {
	test_mode('Valid: "production"', "hello", false);
	test_mode('Valid: "development"', "hello", false);
	test_mode('Valid: "hello"', "hello", false);
	test_mode('Invalid: ""', "", true);
	test_mode("Invalid: true", true, true);
	test_mode("Invalid: false", true, true);
	test_mode("Invalid: NaN", NaN, true);
	test_mode("Invalid: 123", 123, true);
	test_mode("Invalid: {}", {}, true);
	test_mode("Invalid: null", null, true);
	test_mode("Invalid: Promise", Promise.resolve(), true);
	test_mode("Invalid: Symbol", Symbol("hello"), true);
});
describe("Param: outputFolder", () => {
	test_outputFolder("Valid: __dirname", join(__dirname, "dummy"), false);
	test_outputFolder('Valid: ""', "", false);
	test_outputFolder('Invalid: "myfolder"', "myfolder", true);
	test_outputFolder('Invalid: "./myfolder"', "./myfolder", true);
	test_outputFolder("Invalid: NaN", NaN, true);
	test_outputFolder("Invalid: 123", 123, true);
	test_outputFolder("Invalid: null", null, true);
	test_outputFolder("Invalid: false", false, true);
	test_outputFolder("Invalid: true", true, true);
	test_outputFolder("Invalid: {}", {}, true);
	test_outputFolder("Invalid: Promise", Promise.resolve(), true);
	test_outputFolder("Invalid: Symbol", Symbol("hello"), true);
});
describe("Param: rootFolder", () => {
	test_rootFolder("Valid: __dirname", __dirname, false);
	test_rootFolder('Valid: ""', "", false);
	test_rootFolder('Invalid: "myfolder"', "myfolder", true);
	test_rootFolder('Invalid: "./myfolder"', "./myfolder", true);
	test_rootFolder("Invalid: NaN", NaN, true);
	test_rootFolder("Invalid: 123", 123, true);
	test_rootFolder("Invalid: null", null, true);
	test_rootFolder("Invalid: false", false, true);
	test_rootFolder("Invalid: true", true, true);
	test_rootFolder("Invalid: {}", {}, true);
	test_rootFolder("Invalid: Promise", Promise.resolve(), true);
	test_rootFolder("Invalid: Symbol", Symbol("hello"), true);
});
describe("Param: skipHashes", () => {
	test_skipHashes("Valid: true", true, false);
	test_skipHashes("Valid: false", true, false);
	test_skipHashes('Invalid: ""', "", true);
	test_skipHashes('Invalid: "true"', "true", true);
	test_skipHashes('Invalid: "false"', "false", true);
	test_skipHashes("Invalid: 123", 123, true);
	test_skipHashes("Invalid: 0", 0, true);
	test_skipHashes("Invalid: NaN", NaN, true);
	test_skipHashes("Invalid: -1", -1, true);
	test_skipHashes("Invalid: {}", {}, true);
	test_skipHashes("Invalid: null", null, true);
	test_skipHashes("Invalid: Symbol", Symbol("true"), true);
});
describe("Param: skipReset", () => {
	test_skipReset("Valid: true", true, false);
	test_skipReset("Valid: false", true, false);
	test_skipReset('Invalid: ""', "", true);
	test_skipReset('Invalid: "true"', "true", true);
	test_skipReset('Invalid: "false"', "false", true);
	test_skipReset("Invalid: 123", 123, true);
	test_skipReset("Invalid: 0", 0, true);
	test_skipReset("Invalid: NaN", NaN, true);
	test_skipReset("Invalid: -1", -1, true);
	test_skipReset("Invalid: {}", {}, true);
	test_skipReset("Invalid: null", null, true);
	test_skipReset("Invalid: Symbol", Symbol("true"), true);
});
describe("Param: sourcemaps", () => {
	test_sourcemaps("Valid: true", true, false);
	test_sourcemaps("Valid: false", true, false);
	test_sourcemaps('Invalid: ""', "", true);
	test_sourcemaps('Invalid: "true"', "true", true);
	test_sourcemaps('Invalid: "false"', "false", true);
	test_sourcemaps("Invalid: 123", 123, true);
	test_sourcemaps("Invalid: 0", 0, true);
	test_sourcemaps("Invalid: NaN", NaN, true);
	test_sourcemaps("Invalid: -1", -1, true);
	test_sourcemaps("Invalid: {}", {}, true);
	test_sourcemaps("Invalid: null", null, true);
	test_sourcemaps("Invalid: Symbol", Symbol("true"), true);
});

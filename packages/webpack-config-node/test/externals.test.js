/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {readFileSync} = require("fs");
const {outputFileSync} = require("fs-extra");
const {join} = require("path");
const {build, runNodeScript} = require("../../functions");

/**
 * Use `commonjs THENAME` to exclude modules from the bundle
 * or replace by another runtime module.
 *
 * Don't use externals array (as it doesn't work unless you're building a library):
 * https://github.com/webpack/webpack/issues/10201
 *
 * Also this documentation example is wrong
 * because test results show that functions receive three parameters:
 * https://webpack.js.org/configuration/externals/#function
 *
 */
describe("Externals", function () {
	it("Accepts: Undefined", async function () {
		const id = "externals_undefined";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-undefined.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-undefined.js",
			expectOutput: ["EXTERNALS UNDEFINED MODULE1 MODULE2"]
		});
	});

	it("Accepts: Globals", async function () {
		const id = "externals_globals";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-globals.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-globals.js",
			expectOutput: ["EXTERNALS GLOBALS GLOBAL1 GLOBAL2"]
		});
	});

	it("Accepts: CommonJS, Preserve, String", async function () {
		const id = "externals_commonjs_preserve_string";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-commonjs-preserve-string.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-commonjs-preserve-string.js",
			expectOutput: ["EXTERNALS COMMONJS PRESERVE STRING MODULE1 MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-preserve-string.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), true, "fake1 is external");
		strictEqual(raw.includes('require("fake2")'), false, "fake2 isn't external");
	});

	it("Accepts: CommonJS, Preserve, Function", async function () {
		const id = "externals_commonjs_preserve_function";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-commonjs-preserve-function.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-commonjs-preserve-function.js",
			expectOutput: ["EXTERNALS COMMONJS PRESERVE FUNCTION MODULE1 MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-preserve-function.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), true, "fake1 is external");
		strictEqual(raw.includes('require("fake2")'), false, "fake2 isn't external");
	});

	it("Accepts: CommonJS, Replace, String", async function () {
		const id = "externals_commonjs_replace_string";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-commonjs-replace-string.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-commonjs-replace-string.js",
			expectOutput: ["EXTERNALS COMMONJS REPLACE STRING MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-replace-string.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), false, "fake1 isn't external");
		strictEqual(raw.includes('require("fake2")'), true, "fake2 is external");
	});

	it("Accepts: CommonJS, Replace, Function", async function () {
		const id = "externals_commonjs_replace_function";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-commonjs-replace-function.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-commonjs-replace-function.js",
			expectOutput: ["EXTERNALS COMMONJS REPLACE FUNCTION MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-replace-function.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), false, "fake1 isn't external");
		strictEqual(raw.includes('require("fake2")'), true, "fake2 is external");
	});

	it("Accepts: CommonJS, Relative Path, String", async function () {
		const id = "externals_commonjs_relative_string";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-commonjs-relative-string.js"]});
		outputFileSync(join(dist, "thirdparty/polyfills.js"), '"use strict";\nmodule.exports = "POLYFILLS";', "utf8");
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-commonjs-relative-string.js",
			expectOutput: ["EXTERNALS COMMONJS REPLACE STRING POLYFILLS MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-relative-string.js"), "utf8");
		strictEqual(raw.includes('require("./thirdparty/polyfills")'), false, "fake1 was replaced");
	});

	it("Fails: Relative Path, String", async function () {
		const id = "externals_relative_string";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-relative-string.js"]});
		outputFileSync(join(dist, "thirdparty/polyfills.js"), '"use strict";\nmodule.exports = "POLYFILLS";', "utf8");
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-relative-string.js",
			expectError: true
		});
	});

	it("Fails: Relative Path, Array", async function () {
		const id = "externals_relative_array";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-externals-relative-array.js"]});
		outputFileSync(
			join(dist, "thirdparty/polyfills.js"),
			'"use strict";\nmodule.exports = {dummy1: "DUMMY1"};',
			"utf8"
		);
		await runNodeScript({
			cwd: dist,
			filepath: "app-externals-relative-array.js",
			expectError: true
		});
	});
});

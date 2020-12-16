/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {existsSync, readFileSync} = require("fs");
const {join} = require("path");
const {build, runNodeScript} = require("../../functions");

describe("Native modules", function () {
	it("assert: require", async function () {
		const dist = join(process.cwd(), "test/assert_require/dist");
		await build({
			id: "assert_require",
			expectFiles: ["app-assert-require.js"]
		});
		const raw = readFileSync(join(dist, "app-assert-require.js"), "utf8");
		if (!raw.includes('module.exports = require("assert")')) {
			throw new Error("Cannot find require(assert) in output");
		}
		await runNodeScript({
			cwd: dist,
			filepath: "app-assert-require.js",
			expectOutput: ["ASSERT REQUIRE true"]
		});
	});

	it("assert: import", async function () {
		const dist = join(process.cwd(), "test/assert_import/dist");
		await build({
			id: "assert_import",
			expectFiles: ["app-assert-import.js"]
		});
		const raw = readFileSync(join(dist, "app-assert-import.js"), "utf8");
		if (!raw.includes('module.exports = require("assert")')) {
			throw new Error("Cannot find require(assert) in output");
		}
		await runNodeScript({
			cwd: dist,
			filepath: "app-assert-import.js",
			expectOutput: ["ASSERT IMPORT true"]
		});
	});

	it("fs: require", async function () {
		const dist = join(process.cwd(), "test/fs_require/dist");
		await build({
			id: "fs_require",
			expectFiles: ["app-fs-require.js"]
		});
		const raw = readFileSync(join(dist, "app-fs-require.js"), "utf8");
		if (!raw.includes('module.exports = require("fs")')) {
			throw new Error("Cannot find require(fs) in output");
		}
		await runNodeScript({
			cwd: dist,
			filepath: "app-fs-require.js",
			expectOutput: ["FS REQUIRE OK"]
		});
		if (!existsSync(join(dist, "example-fs-require.txt"))) {
			throw new Error("The text file is missing");
		}
	});

	it("fs: import", async function () {
		const dist = join(process.cwd(), "test/fs_import/dist");
		await build({
			id: "fs_import",
			expectFiles: ["app-fs-import.js"]
		});
		const raw = readFileSync(join(dist, "app-fs-import.js"), "utf8");
		if (!raw.includes('module.exports = require("fs")')) {
			throw new Error("Cannot find require(fs) in output");
		}
		await runNodeScript({
			cwd: dist,
			filepath: "app-fs-import.js",
			expectOutput: ["FS IMPORT OK"]
		});
		if (!existsSync(join(dist, "example-fs-import.txt"))) {
			throw new Error("The text file is missing");
		}
	});

	it("__dirname", async function () {
		const dist = join(process.cwd(), "test/dirname/dist");
		await build({
			id: "dirname",
			expectFiles: ["app-dirname.js"]
		});
		await runNodeScript({
			cwd: dist,
			filepath: "app-dirname.js",
			expectOutput: [`Dirname ${dist}`]
		});
	});

	it("process.cwd()", async function () {
		const dist = join(process.cwd(), "test/cwd/dist");
		await build({
			id: "cwd",
			expectFiles: ["app-cwd.js"]
		});
		await runNodeScript({
			cwd: dist,
			filepath: "app-cwd.js",
			expectOutput: [`CWD ${dist}`]
		});
	});
});

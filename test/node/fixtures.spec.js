/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {strictEqual, deepStrictEqual} = require("assert");
const {existsSync, readFileSync} = require("fs");
const {copySync, removeSync, outputFileSync} = require("fs-extra");
const {compileFixture, execCommand} = require("../shared");
const dist = join(__dirname, `../../tmp/dist`);

before(function () {
	removeSync(join(__dirname, `../../tmp/node_modules/@wildpeaks/webpack-config-node`));
	copySync(
		join(__dirname, `../../packages/webpack-config-node`),
		join(__dirname, `../../tmp/node_modules/@wildpeaks/webpack-config-node`)
	);
	// prettier-ignore
	copySync(
		join(__dirname, "tsconfig.json"),
		join(__dirname, "../../tmp/tsconfig.json")
	);
});

async function testCompile({id, sources, compiled, extras}) {
	const fixtureFolder = join(__dirname, id);
	const {filesBefore, errors, filesAfter} = await compileFixture(fixtureFolder, extras);

	let expectBefore = sources;
	if (extras) {
		expectBefore = expectBefore.concat(["dist/extra-1.txt", "dist/extra-2.js", "dist/extra-3.ts"]);
	}
	expectBefore = expectBefore.sort();
	const expectAfter = sources.concat(compiled).sort();

	deepStrictEqual(filesBefore, expectBefore, "Before Webpack");
	deepStrictEqual(errors, [], "No Webpack errors");
	if (typeof compiled !== "undefined") {
		deepStrictEqual(filesAfter, expectAfter, "After Webpack");
	}
	return filesAfter;
}

async function runScript({main, expectRuntimeError, expectOutput}) {
	const runtime = await execCommand(`node ${main}`, dist);
	if (expectRuntimeError) {
		if (runtime.errors.length === 0) {
			throw new Error("Expected fixtured to fail runtime");
		}
		return;
	}
	deepStrictEqual(runtime, {
		errors: [],
		output: expectOutput
	});
}

describe("Core", function () {
	it("Basic", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "basic",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-basic.js"]
		});
		await runScript({
			main: "app-basic.js",
			expectOutput: ["Basic"]
		});
	});

	it("Custom Filename", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "basic_filename",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/subfolder/custom.app-basic-filename.js"]
		});
		await runScript({
			main: "subfolder/custom.app-basic-filename.js",
			expectOutput: ["Basic Filename"]
		});
	});

	it("Multiple independant entries", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "multiple_entry",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application-1.ts",
				"src/application-2.ts",
				"src/application-3.ts"
			],
			compiled: ["dist/app-multiple-1.js", "dist/app-multiple-2.js", "dist/app-multiple-3.js"]
		});
		await runScript({
			main: "app-multiple-1.js",
			expectOutput: ["Multiple 1"]
		});
		await runScript({
			main: "app-multiple-2.js",
			expectOutput: ["Multiple 2"]
		});
		await runScript({
			main: "app-multiple-3.js",
			expectOutput: ["Multiple 3"]
		});
	});

	it("Sourcemaps", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "sourcemaps",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-sourcemaps.js", "dist/app-sourcemaps.js.map"]
		});
		await runScript({
			main: "app-sourcemaps.js",
			expectOutput: ["Sourcemaps"]
		});
	});

	it("Production mode", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);

		const sources = ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"];
		const compiled = ["dist/%%HASH%%.app-production.js"];
		const filesAfter = await testCompile({id: "production", sources});

		let hash = "";
		for (const fileAfter of filesAfter) {
			const regex = /^dist\/([^.]+)\.app-production\.js$/;
			const matches = regex.exec(fileAfter);
			if (matches) {
				hash = matches[1];
				break;
			}
		}
		if (hash === "") {
			throw new Error("No hash found");
		}

		const expectAfter = sources
			.concat(compiled)
			.map((filename) => filename.replace("%%HASH%%", hash))
			.sort();
		deepStrictEqual(filesAfter, expectAfter, "After Webpack");

		const jsRaw = readFileSync(join(dist, `${hash}.app-production.js`), "utf8");
		if (!jsRaw.startsWith("!function(")) {
			throw new Error("JS is not minified");
		}

		await runScript({
			main: `${hash}.app-production.js`,
			expectOutput: ["Production"]
		});
	});

	it("Production mode & Skip hashes", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);

		const sources = ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"];
		const compiled = ["dist/app-production-skip-hashes.js"];
		const filesAfter = await testCompile({id: "production_skip_hashes", sources});

		let hash = "";
		for (const fileAfter of filesAfter) {
			const regex = /^dist\/([^.]+)\.app-production-skip-hashes\.js$/;
			const matches = regex.exec(fileAfter);
			if (matches) {
				hash = matches[1];
				break;
			}
		}
		if (hash !== "") {
			throw new Error("Hashes were not skipped");
		}

		const expectAfter = sources.concat(compiled).sort();
		deepStrictEqual(filesAfter, expectAfter, "After Webpack");

		const jsRaw = readFileSync(join(dist, "app-production-skip-hashes.js"), "utf8");
		if (!jsRaw.startsWith("!function(")) {
			throw new Error("JS is not minified");
		}

		await runScript({
			main: "app-production-skip-hashes.js",
			expectOutput: ["Production Skip Hashes"]
		});
	});

	it("Chunks", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "chunks",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/modules/mymodule.ts"
			],
			compiled: ["dist/app-chunks.js", "dist/chunk.0.js"]
		});
		await runScript({
			main: "app-chunks.js",
			expectOutput: ["CHUNKS initially", "CHUNKS delayed 100123"]
		});
	});

	it("Chunks: Custom Filename", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "chunks_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/modules/mymodule.ts"
			],
			compiled: ["dist/app-chunks-filename.js", "dist/subfolder/custom.chunk.0.js"]
		});
		await runScript({
			main: "app-chunks-filename.js",
			expectOutput: ["CHUNKS FILENAME initially", "CHUNKS FILENAME delayed 100123"]
		});
	});
});

describe("Native modules", function () {
	it("assert: require", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "assert_require",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-assert-require.js"]
		});
		const raw = readFileSync(join(dist, "app-assert-require.js"), "utf8");
		if (!raw.includes('module.exports = require("assert")')) {
			throw new Error("Cannot find require(assert) in output");
		}
		await runScript({
			main: "app-assert-require.js",
			expectOutput: ["ASSERT REQUIRE true"]
		});
	});

	it("assert: import", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "assert_import",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-assert-import.js"]
		});
		const raw = readFileSync(join(dist, "app-assert-import.js"), "utf8");
		if (!raw.includes('module.exports = require("assert")')) {
			throw new Error("Cannot find require(assert) in output");
		}
		await runScript({
			main: "app-assert-import.js",
			expectOutput: ["ASSERT IMPORT true"]
		});
	});

	it("fs: require", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "fs_require",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-fs-require.js"]
		});
		const raw = readFileSync(join(dist, "app-fs-require.js"), "utf8");
		if (!raw.includes('module.exports = require("fs")')) {
			throw new Error("Cannot find require(fs) in output");
		}
		await runScript({
			main: "app-fs-require.js",
			expectOutput: ["FS REQUIRE OK"]
		});
		if (!existsSync(join(dist, "example-fs-require.txt"))) {
			throw new Error("The text file is missing");
		}
	});

	it("fs: import", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "fs_import",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-fs-import.js"]
		});
		const raw = readFileSync(join(dist, "app-fs-import.js"), "utf8");
		if (!raw.includes('module.exports = require("fs")')) {
			throw new Error("Cannot find require(fs) in output");
		}
		await runScript({
			main: "app-fs-import.js",
			expectOutput: ["FS IMPORT OK"]
		});
		if (!existsSync(join(dist, "example-fs-import.txt"))) {
			throw new Error("The text file is missing");
		}
	});

	it("__dirname", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "dirname",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-dirname.js"]
		});
		await runScript({
			main: "app-dirname.js",
			expectOutput: [`Dirname ${dist}`]
		});
	});

	it("process.cwd()", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "cwd",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-cwd.js"]
		});
		await runScript({
			main: "app-cwd.js",
			expectOutput: [`CWD ${dist}`]
		});
	});
});

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
	it("Accepts: Undefined", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_undefined",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-undefined.js"]
		});
		await runScript({
			main: "app-externals-undefined.js",
			expectOutput: ["EXTERNALS UNDEFINED MODULE1 MODULE2"]
		});
	});

	it("Accepts: Globals", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_globals",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/types.d.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-globals.js"]
		});
		await runScript({
			main: "app-externals-globals.js",
			expectOutput: ["EXTERNALS GLOBALS GLOBAL1 GLOBAL2"]
		});
	});

	it("Accepts: CommonJS, Preserve, String", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_commonjs_preserve_string",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-commonjs-preserve-string.js"]
		});
		await runScript({
			main: "app-externals-commonjs-preserve-string.js",
			expectOutput: ["EXTERNALS COMMONJS PRESERVE STRING MODULE1 MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-preserve-string.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), true, "fake1 is external");
		strictEqual(raw.includes('require("fake2")'), false, "fake2 isn't external");
	});

	it("Accepts: CommonJS, Preserve, Function", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_commonjs_preserve_function",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-commonjs-preserve-function.js"]
		});
		await runScript({
			main: "app-externals-commonjs-preserve-function.js",
			expectOutput: ["EXTERNALS COMMONJS PRESERVE FUNCTION MODULE1 MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-preserve-function.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), true, "fake1 is external");
		strictEqual(raw.includes('require("fake2")'), false, "fake2 isn't external");
	});

	it("Accepts: CommonJS, Replace, String", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_commonjs_replace_string",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-commonjs-replace-string.js"]
		});
		await runScript({
			main: "app-externals-commonjs-replace-string.js",
			expectOutput: ["EXTERNALS COMMONJS REPLACE STRING MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-replace-string.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), false, "fake1 isn't external");
		strictEqual(raw.includes('require("fake2")'), true, "fake2 is external");
	});

	it("Accepts: CommonJS, Replace, Function", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_commonjs_replace_function",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-commonjs-replace-function.js"]
		});
		await runScript({
			main: "app-externals-commonjs-replace-function.js",
			expectOutput: ["EXTERNALS COMMONJS REPLACE FUNCTION MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-replace-function.js"), "utf8");
		strictEqual(raw.includes('require("fake1")'), false, "fake1 isn't external");
		strictEqual(raw.includes('require("fake2")'), true, "fake2 is external");
	});

	it("Accepts: CommonJS, Relative Path, String", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_commonjs_relative_string",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-commonjs-relative-string.js"]
		});
		outputFileSync(join(dist, "thirdparty/polyfills.js"), '"use strict";\nmodule.exports = "POLYFILLS";', "utf8");
		await runScript({
			main: "app-externals-commonjs-relative-string.js",
			expectOutput: ["EXTERNALS COMMONJS REPLACE STRING POLYFILLS MODULE2"]
		});
		const raw = readFileSync(join(dist, "app-externals-commonjs-relative-string.js"), "utf8");
		strictEqual(raw.includes('require("./thirdparty/polyfills")'), false, "fake1 was replaced");
	});

	it("Fails: Relative Path, String", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_relative_string",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-relative-string.js"]
		});
		outputFileSync(join(dist, "thirdparty/polyfills.js"), '"use strict";\nmodule.exports = "POLYFILLS";', "utf8");
		await runScript({
			main: "app-externals-relative-string.js",
			expectRuntimeError: true
		});
	});

	it("Fails: Relative Path, Array", /* @this */ async function () {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_relative_array",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/app-externals-relative-array.js"]
		});
		outputFileSync(
			join(dist, "thirdparty/polyfills.js"),
			'"use strict";\nmodule.exports = {dummy1: "DUMMY1"};',
			"utf8"
		);
		await runScript({
			main: "app-externals-relative-array.js",
			expectRuntimeError: true
		});
	});
});

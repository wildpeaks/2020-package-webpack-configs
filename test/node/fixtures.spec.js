/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {deepStrictEqual} = require("assert");
const {existsSync, readFileSync} = require("fs");
const {copySync, removeSync} = require("fs-extra");
const {compileFixture, execCommand} = require("../shared");
const dist = join(__dirname, `../../tmp/dist`);

before(function() {
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

describe("Node", function() {
	it("Basic", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "basic",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
			compiled: [
				"dist/app-basic.js"
			]
		});
		await runScript({
			main: "app-basic.js",
			expectOutput: ["Basic"]
		});
	});

	it("Custom Filename", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "basic_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
			compiled: [
				"dist/subfolder/custom.app-basic-filename.js"
			]
		});
		await runScript({
			main: "subfolder/custom.app-basic-filename.js",
			expectOutput: ["Basic Filename"]
		});
	});

	it("Multiple independant entries", /* @this */ async function() {
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
			compiled: [
				"dist/app-multiple-1.js",
				"dist/app-multiple-2.js",
				"dist/app-multiple-3.js"
			]
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

	it("Sourcemaps", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "sourcemaps",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
			compiled: [
				"dist/app-sourcemaps.js",
				"dist/app-sourcemaps.js.map"
			]
		});
		await runScript({
			main: "app-sourcemaps.js",
			expectOutput: ["Sourcemaps"]
		});
	});

	it("Production mode", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);

		const sources = [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		];
		const compiled = [
			"dist/%%HASH%%.app-production.js"
		];
		const filesAfter = await testCompile({id: "production",	sources});

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

		const expectAfter = sources.concat(compiled).map(filename => filename.replace("%%HASH%%", hash)).sort();
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

	it("Production mode & Skip hashes", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);

		const sources = [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		];
		const compiled = [
			"dist/app-production-skip-hashes.js"
		];
		const filesAfter = await testCompile({id: "production_skip_hashes",	sources});

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
});

describe("Node: Native modules", function() {
	it("fs: require", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "require_fs",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-require-fs.js"]
		});

		const raw = readFileSync(join(dist, "app-require-fs.js"), "utf8");
		if (!raw.includes('module.exports = require("fs")')) {
			throw new Error("Cannot find require(fs) in output");
		}
		await runScript({
			main: "app-require-fs.js",
			expectOutput: ["REQUIRE FS OK"]
		});
		if (!existsSync(join(dist, "example-require-fs.txt"))) {
			throw new Error("The text file is missing");
		}
	});

	it("fs: import", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "import_fs",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-import-fs.js"]
		});

		const raw = readFileSync(join(dist, "app-import-fs.js"), "utf8");
		if (!raw.includes('module.exports = require("fs")')) {
			throw new Error("Cannot find require(fs) in output");
		}
		await runScript({
			main: "app-import-fs.js",
			expectOutput: ["IMPORT FS OK"]
		});
		if (!existsSync(join(dist, "example-import-fs.txt"))) {
			throw new Error("The text file is missing");
		}
	});
});

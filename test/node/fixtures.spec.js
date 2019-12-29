/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {deepStrictEqual} = require("assert");
const {copySync, removeSync} = require("fs-extra");
const {compileFixture, execCommand} = require("../shared");
const dist = join(__dirname, `../../tmp/dist`);

before(function() {
	removeSync(
		join(__dirname, `../../tmp/node_modules/@wildpeaks/webpack-config-node`)
	);
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

async function testCompile({id, sources, compiled, extras, main, expectRuntimeError, expectOutput}) {
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
	deepStrictEqual(filesAfter, expectAfter, "After Webpack");

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

describe("Node: Core", function() {
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
			],
			main: "app-basic.js",
			expectRuntimeError: false,
			expectOutput: ["Basic"]
		});
	});
});

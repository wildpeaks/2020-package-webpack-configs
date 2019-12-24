/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {deepStrictEqual} = require("assert");
const {copySync, removeSync} = require("fs-extra");
const {compileFixture} = require("../shared");

before(function() {
	// prettier-ignore
	removeSync(
		join(__dirname, `../../tmp/node_modules/@wildpeaks/webpack-config-node`)
	);
	copySync(
		join(__dirname, `../../packages/webpack-config-node`),
		join(__dirname, `../../tmp/node_modules/@wildpeaks/webpack-config-node`)
	);
	// prettier-ignore
	copySync(
		join(__dirname, `tsconfig.json`),
		join(__dirname, "../../tmp/tsconfig.json")
	);
});

function testFixture({id, title, sourceFiles, webpackFiles /*, main, logs*/}) {
	it(title, /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);

		const fixtureFolder = join(__dirname, id);
		const compiled = await compileFixture(fixtureFolder);
		deepStrictEqual(compiled.filesBefore, sourceFiles.sort(), "Before Webpack");
		deepStrictEqual(compiled.errors, [], "No Webpack errors");
		deepStrictEqual(compiled.filesAfter, sourceFiles.concat(webpackFiles).sort(), "After Webpack");
		// console.log(compiled.output);

		//
		// TODO run the compiled files and compare logs
		//
	});
}


describe("Node Fixtures", function() {
	testFixture({
		id: "basic",
		title: "Accepts: Basic",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		],
		webpackFiles: [
			"dist/app-basic.js"
		],
		main: "dist/app-basic.js",
		logs: [
			"[BASIC] Hello World"
		]
	});
});

/* eslint-env node, mocha */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const {join, relative} = require("path");
const {mkdirSync, writeFileSync} = require("fs");
const express = require("express");
const rimraf = require("rimraf");
const rreaddir = require("recursive-readdir");
const webpack = require("webpack");
const getConfig = require("../packages/webpack-config-web");
const rootFolder = join(__dirname, "fixtures");
const outputFolder = join(__dirname, "../tmp-clean");
let app;
let server;
const port = 8881;

/**
 * @param {webpack.Configuration} config
 */
function compile(config) {
	return new Promise((resolve, reject) => {
		webpack(config, (err, stats) => {
			if (err) {
				reject(err);
			} else {
				resolve(stats);
			}
		});
	});
}

/**
 * @param {Object} options
 * @returns {String[]}
 */
async function testFixture(options) {
	const config = getConfig(options);
	strictEqual(typeof options, "object");

	const stats = await compile(config);
	deepStrictEqual(stats.compilation.errors, []);

	let actualFiles = await rreaddir(outputFolder);
	actualFiles = actualFiles.map(filepath => relative(outputFolder, filepath).replace(/\\/g, "/"));
	return actualFiles;
}

before(() => {
	app = express();
	app.use(express.static(outputFolder));
	server = app.listen(port);
});

after(done => {
	server.close(() => {
		done();
	});
});

beforeEach(done => {
	rimraf(outputFolder, () => {
		mkdirSync(outputFolder);
		done();
	});
});

it("skipReset: false", /* @this */ async function() {
	this.slow(10000);
	this.timeout(10000);
	writeFileSync(join(outputFolder, "extra-1.txt"), "Hello World");
	writeFileSync(join(outputFolder, "extra-2.js"), "Hello World");
	writeFileSync(join(outputFolder, "extra-3.ts"), "Hello World");

	const actualFiles = await testFixture({
		skipReset: false,
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./basic/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());
});

it("skipReset: true", /* @this */ async function() {
	this.slow(10000);
	this.timeout(10000);
	writeFileSync(join(outputFolder, "extra-1.txt"), "Hello World");
	writeFileSync(join(outputFolder, "extra-2.js"), "Hello World");
	writeFileSync(join(outputFolder, "extra-3.ts"), "Hello World");

	const actualFiles = await testFixture({
		skipReset: true,
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./basic/myapp.ts"
		}
	});
	const expectedFiles = ["extra-1.txt", "extra-2.js", "extra-3.ts", "index.html", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());
});

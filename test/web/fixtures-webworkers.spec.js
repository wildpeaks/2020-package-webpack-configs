/* eslint-env node, mocha */
/* global document */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const {join, relative} = require("path");
const {mkdirSync} = require("fs");
const express = require("express");
const rimraf = require("rimraf");
const rreaddir = require("recursive-readdir");
const webpack = require("webpack");
const puppeteer = require("puppeteer");
const getConfig = require("../../packages/webpack-config-web");
const rootFolder = join(__dirname, "fixtures");
const outputFolder = join(__dirname, "../tmp-webworkers");
let app;
let server;
const port = 8883;

/**
 * @param {Number} duration
 */
function sleep(duration) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}

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

it("Webworker: basic", /* @this */ async function() {
	this.slow(10000);
	this.timeout(10000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./webworker/myapp.ts"
		}
	});
	const expectedFiles = [
		"index.html",
		"myapp.js",
		"myapp.js.map",
		"myworker.webworker.js",
		"myworker.webworker.js.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		await sleep(300);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			if (el.innerText !== "WORKER replies HELLO") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Webworker: custom filename", /* @this */ async function() {
	this.slow(10000);
	this.timeout(10000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		webworkerFilename: "subfolder/custom.[name].js",
		mode: "development",
		entry: {
			myapp: "./webworker/myapp.ts"
		}
	});
	const expectedFiles = [
		"index.html",
		"myapp.js",
		"myapp.js.map",
		"subfolder/custom.myworker.webworker.js",
		"subfolder/custom.myworker.webworker.js.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		await sleep(300);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			if (el.innerText !== "WORKER replies HELLO") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Webworker: polyfills", /* @this */ async function() {
	this.slow(10000);
	this.timeout(10000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./webworker-polyfills/myapp.ts"
		},
		polyfills: [
			"./webworker-polyfills/both.polyfill.ts",
			"./webworker-polyfills/only-main.polyfill.ts"
		],
		webworkerPolyfills: ["./both.polyfill", "./only-worker.polyfill", "module-self-polyfill"]
	});
	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map", "myapp.webworker.js", "myapp.webworker.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		await sleep(300);
		const found = await page.evaluate(() => {
			const el1 = document.getElementById("hello1");
			const el2 = document.getElementById("hello2");
			if (el1 === null) {
				return "#hello1 not found";
			}
			if (el1.innerText !== "BOTH once undefined MAIN once undefined") {
				return `Bad #hello1.innerText: ${el1.innerText}`;
			}
			if (el2 === null) {
				return "#hello2 not found";
			}
			if (el2.innerText !== "BOTH once WORKER once undefined MODULE once") {
				return `Bad #hello2.innerText: ${el2.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Webworker: without export {}", /* @this */ async function() {
	this.slow(10000);
	this.timeout(10000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./webworker-no-export/myapp.ts"
		}
	});
	const expectedFiles = [
		"index.html",
		"myapp.js",
		"myapp.js.map",
		"myworker.webworker.js",
		"myworker.webworker.js.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		await sleep(300);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			if (el.innerText !== "WORKER replies HELLO") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

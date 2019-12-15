/* eslint-env node, mocha */
/* global document */
/* global window */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const {join, relative} = require("path");
const {mkdirSync} = require("fs");
const express = require("express");
const rimraf = require("rimraf");
const rreaddir = require("recursive-readdir");
const webpack = require("webpack");
const puppeteer = require("puppeteer");
const getConfig = require("../packages/webpack-config-web");
const rootFolder = join(__dirname, "fixtures");
const outputFolder = join(__dirname, "../tmp-css");
let app;
let server;
const port = 8884;

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

it("CSS Modules", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./css-modules/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 128, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("CSS Filename", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		cssFilename: "subfolder/custom.[name].css",
		mode: "development",
		entry: {
			myapp: "./css-modules/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = [
		"index.html",
		"subfolder/custom.myapp.css",
		"subfolder/custom.myapp.css.map",
		"myapp.js",
		"myapp.js.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 128, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("CSS without CSS Modules", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./css-no-modules/myapp.ts"
		},
		cssModules: false
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 128, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("CSS Reset", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./css-reset/myapp.ts"
		},
		polyfills: ["./css-reset/reset.css"]
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.createElement("div");
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue("color") === "rgb(0, 0, 128)") {
				return "Unexpected color before appending";
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue("color") !== "rgb(0, 0, 128)") {
				return "Bad color: " + computed2.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS: Reset", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-reset/myapp.ts"
		},
		polyfills: ["./scss-reset/reset.scss"]
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.createElement("div");
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue("color") === "rgb(0, 128, 0)") {
				return "Unexpected color before appending";
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue("color") !== "rgb(0, 128, 0)") {
				return "Bad color: " + computed2.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS Global Import", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-globals-import/myapp.ts"
		},
		scss: '@import "variables.scss";',
		polyfills: ["./scss-globals-import/reset.scss"]
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.createElement("div");
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue("color") === "rgb(128, 0, 0)") {
				return "Unexpected color before appending";
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue("color") !== "rgb(128, 0, 0)") {
				return "Bad color: " + computed2.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS Global Variables", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-globals-define/myapp.ts"
		},
		scss: "$mycolor: rgb(128, 128, 0);",
		polyfills: ["./scss-globals-define/reset.scss"]
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.createElement("div");
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue("color") === "rgb(128, 128, 0)") {
				return "Unexpected color before appending";
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue("color") !== "rgb(128, 128, 0)") {
				return "Bad color: " + computed2.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS Basic", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-basic/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 128, 255)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS Import File", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-import-file/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 0, 255)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS Import Module", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-import-module/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 255, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("CSS Chunks", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./css-chunks/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = [
		"index.html",
		"myapp.css",
		"myapp.css.map",
		"myapp.js",
		"myapp.js.map",
		"chunk.0.js",
		"chunk.0.js.map",
		"chunk.0.css",
		"chunk.0.css.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const result1 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 255, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result1, "ok", "Sync color");

		await sleep(300);
		const result2 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 0, 255)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result2, "ok", "Async color");
	} finally {
		await browser.close();
	}
});

it("CSS Chunk Filename", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		cssChunkFilename: "subfolder/custom.chunk.[id].css",
		mode: "development",
		entry: {
			myapp: "./css-chunks/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = [
		"index.html",
		"myapp.css",
		"myapp.css.map",
		"myapp.js",
		"myapp.js.map",
		"chunk.0.js",
		"chunk.0.js.map",
		"subfolder/custom.chunk.0.css",
		"subfolder/custom.chunk.0.css.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const result1 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 255, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result1, "ok", "Sync color");

		await sleep(300);
		const result2 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 0, 255)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result2, "ok", "Async color");
	} finally {
		await browser.close();
	}
});

it("SCSS Chunks", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-chunks/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = [
		"index.html",
		"myapp.css",
		"myapp.css.map",
		"myapp.js",
		"myapp.js.map",
		"chunk.0.js",
		"chunk.0.js.map",
		"chunk.0.css",
		"chunk.0.css.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const result1 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 255, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result1, "ok", "Sync color");

		await sleep(300);
		const result2 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 0, 255)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result2, "ok", "Async color");
	} finally {
		await browser.close();
	}
});

it("SCSS Chunk Filename", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		cssChunkFilename: "subfolder/custom.chunk.[id].css",
		mode: "development",
		entry: {
			myapp: "./scss-chunks/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = [
		"index.html",
		"myapp.css",
		"myapp.css.map",
		"myapp.js",
		"myapp.js.map",
		"chunk.0.js",
		"chunk.0.js.map",
		"subfolder/custom.chunk.0.css",
		"subfolder/custom.chunk.0.css.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const result1 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 255, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result1, "ok", "Sync color");

		await sleep(300);
		const result2 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 0, 255)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result2, "ok", "Async color");
	} finally {
		await browser.close();
	}
});

it("SCSS Chunk + SCSS variables", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		scss: `
			$color1: rgb(0, 128, 0);
			$color2: rgb(0, 0, 128);
		`,
		mode: "development",
		entry: {
			myapp: "./scss-chunks-variables/myapp.ts"
		},
		cssModules: true
	});
	const expectedFiles = [
		"index.html",
		"myapp.css",
		"myapp.css.map",
		"myapp.js",
		"myapp.js.map",
		"chunk.0.js",
		"chunk.0.js.map",
		"chunk.0.css",
		"chunk.0.css.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const result1 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 128, 0)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result1, "ok", "Sync color");

		await sleep(300);
		const result2 = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue("color") !== "rgb(0, 0, 128)") {
				return "Bad color: " + computed.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(result2, "ok", "Async color");
	} finally {
		await browser.close();
	}
});

it("SCSS data only", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		scss: "body{color: rgb(0, 255, 0)}",
		mode: "development",
		entry: {
			myapp: "./basic/myapp.ts"
		}
	});

	// Data alone isn't enough to produce a .css: at least one entry must contain
	// an import or polyfill to a stylesheet, otherwise the loader skips
	// extracting styles, unfortunately.
	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const computed = window.getComputedStyle(document.body);
			if (computed.getPropertyValue("color") === "rgb(0, 255, 0)") {
				return "Unexpected inline style";
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS data + import", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		scss: "body{color: rgb(0, 255, 0)}",
		mode: "development",
		entry: {
			myapp: "./scss-data-import/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const computed1 = window.getComputedStyle(document.body);
			if (computed1.getPropertyValue("color") !== "rgb(0, 255, 0)") {
				return "Wrong body color: " + computed1.getPropertyValue("color");
			}
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue("color") !== "rgb(0, 0, 255)") {
				return "Wrong element color: " + computed2.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS data function", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		scss: () => "body{color: rgb(255, 0, 0)}",
		mode: "development",
		entry: {
			myapp: "./scss-data-import/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const computed1 = window.getComputedStyle(document.body);
			if (computed1.getPropertyValue("color") !== "rgb(255, 0, 0)") {
				return "Wrong body color: " + computed1.getPropertyValue("color");
			}
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue("color") !== "rgb(0, 0, 255)") {
				return "Wrong element color: " + computed2.getPropertyValue("color");
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("SCSS + Image", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./scss-image/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "assets/large.jpg", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		let ok = false;
		const page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on("request", interceptedRequest => {
			const requestUrl = interceptedRequest.url();
			if (requestUrl === `http://localhost:${port}/assets/large.jpg`) {
				ok = true;
			}
			interceptedRequest.continue();
		});
		await page.goto(`http://localhost:${port}/`);
		strictEqual(ok, true, "Image was requested");
	} finally {
		await browser.close();
	}
});

it("CSS + Image", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./css-image/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "assets/large.jpg", "myapp.css", "myapp.css.map", "myapp.js", "myapp.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		let ok = false;
		const page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on("request", interceptedRequest => {
			const requestUrl = interceptedRequest.url();
			if (requestUrl === `http://localhost:${port}/assets/large.jpg`) {
				ok = true;
			}
			interceptedRequest.continue();
		});
		await page.goto(`http://localhost:${port}/`);
		strictEqual(ok, true, "Image was requested");
	} finally {
		await browser.close();
	}
});

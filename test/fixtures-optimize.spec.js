/* eslint-env node, mocha */
/* global document */
/* global window */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const {join, relative} = require("path");
const {readFileSync, mkdirSync} = require("fs");
const express = require("express");
const rimraf = require("rimraf");
const rreaddir = require("recursive-readdir");
const webpack = require("webpack");
const puppeteer = require("puppeteer");
const getConfig = require("../packages/webpack-config-web");
const rootFolder = join(__dirname, "fixtures");
const outputFolder = join(__dirname, "../tmp-optimize");
let app;
let server;
const port = 8882;

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

it("Enable sourcemaps", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./css-modules/myapp.ts"
		},
		sourcemaps: true
	});

	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map", "myapp.css", "myapp.css.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, "myapp.css"), "utf8");
	strictEqual(cssRaw.endsWith("/*# sourceMappingURL=myapp.css.map*/"), true, "CSS has the sourcemap");

	const jsRaw = readFileSync(join(outputFolder, "myapp.js"), "utf8");
	strictEqual(jsRaw.endsWith("//# sourceMappingURL=myapp.js.map"), true, "JS has the sourcemap");
});

it("Disable sourcemaps", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./css-modules/myapp.ts"
		},
		sourcemaps: false
	});

	const expectedFiles = ["index.html", "myapp.js", "myapp.css"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, "myapp.css"), "utf8");
	strictEqual(cssRaw.endsWith("/*# sourceMappingURL=myapp.css.map*/"), false, "CSS has no sourcemap");

	const jsRaw = readFileSync(join(outputFolder, "myapp.js"), "utf8");
	strictEqual(jsRaw.endsWith("//# sourceMappingURL=myapp.js.map"), false, "JS has no sourcemap");
});

it("Minify", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "production",
		entry: {
			myapp: "./css-modules/myapp.ts"
		}
	});

	let hash = "";
	for (const actualFile of actualFiles) {
		const regex = /^([^.]+)\.myapp\.js$/;
		const matches = regex.exec(actualFile);
		if (matches) {
			hash = matches[1];
			break;
		}
	}
	strictEqual(hash !== "", true, "Hash not found");

	const expectedFiles = [
		"index.html",
		`${hash}.myapp.css`,
		`${hash}.myapp.css.map`,
		`${hash}.myapp.js`,
		`${hash}.myapp.js.map`
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, `${hash}.myapp.css`), "utf8");
	if (/^.([^{}]+){color:green}/.exec(cssRaw) === null) {
		throw new Error("CSS is not minified");
	}

	const jsRaw = readFileSync(join(outputFolder, `${hash}.myapp.js`), "utf8");
	strictEqual(jsRaw.startsWith("!function(e){"), true, "JS not minified");

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el0 = document.getElementById("hello");
			if (el0 === null) {
				return "#hello not found";
			}
			if (el0.innerText !== "Hello World") {
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.querySelector("script");
			if (el1 === null) {
				return "No script";
			}
			const jsCrossorigin = el1.getAttribute("crossorigin");
			const jsIntegrity = el1.getAttribute("integrity");
			if (jsCrossorigin !== "anonymous") {
				return `Bad script.crossorigin: ${jsCrossorigin}`;
			}
			if (!jsIntegrity.includes("sha256-") && !jsIntegrity.includes("sha384-")) {
				return `Bad script.integrity: ${jsIntegrity}`;
			}

			const el2 = document.querySelector('link[rel="stylesheet"]');
			if (el2 === null) {
				return "No stylesheet";
			}
			const cssCrossorigin = el2.getAttribute("crossorigin");
			const cssIntegrity = el2.getAttribute("integrity");
			if (cssCrossorigin !== "anonymous") {
				return `Bad link.crossorigin: ${cssCrossorigin}`;
			}
			if (!cssIntegrity.includes("sha256-") && !cssIntegrity.includes("sha384-")) {
				return `Bad link.integrity: ${cssIntegrity}`;
			}

			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Minify & skipHashes", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		skipHashes: true,
		mode: "production",
		entry: {
			myapp: "./css-modules/myapp.ts"
		}
	});

	let hash = "";
	for (const actualFile of actualFiles) {
		const regex = /^([^.]+)\.myapp\.js$/;
		const matches = regex.exec(actualFile);
		if (matches) {
			hash = matches[1];
			break;
		}
	}
	strictEqual(hash, "", "Hash found");

	const expectedFiles = ["index.html", `myapp.css`, `myapp.css.map`, `myapp.js`, `myapp.js.map`];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, `myapp.css`), "utf8");
	if (/^.([^{}]+){color:green}/.exec(cssRaw) === null) {
		throw new Error("CSS is not minified");
	}

	const jsRaw = readFileSync(join(outputFolder, `myapp.js`), "utf8");
	strictEqual(jsRaw.startsWith("!function(e){"), true, "JS not minified");

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const el0 = document.getElementById("hello");
			if (el0 === null) {
				return "#hello not found";
			}
			if (el0.innerText !== "Hello World") {
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.querySelector("script");
			if (el1 === null) {
				return "No script";
			}
			const jsCrossorigin = el1.getAttribute("crossorigin");
			if (jsCrossorigin !== null) {
				return `Bad script.crossorigin: ${jsCrossorigin}`;
			}
			const jsIntegrity = el1.getAttribute("integrity");
			if (jsIntegrity !== null) {
				return `Bad script.integrity: ${jsIntegrity}`;
			}

			const el2 = document.querySelector('link[rel="stylesheet"]');
			if (el2 === null) {
				return "No stylesheet";
			}

			const cssCrossorigin = el2.getAttribute("crossorigin");
			if (cssCrossorigin !== null) {
				return `Bad link.crossorigin: ${cssCrossorigin}`;
			}
			const cssIntegrity = el2.getAttribute("integrity");
			if (cssIntegrity !== null) {
				return `Bad link.integrity: ${cssIntegrity}`;
			}

			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Chunks", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./chunks/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map", "chunk.0.js", "chunk.0.js.map"];
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
			if (el.innerText !== "Delayed 100123") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Chunk Filename", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		jsChunkFilename: "subfolder/custom.chunk.[id].js",
		mode: "development",
		entry: {
			myapp: "./chunks/myapp.ts"
		}
	});
	const expectedFiles = [
		"index.html",
		"myapp.js",
		"myapp.js.map",
		"subfolder/custom.chunk.0.js",
		"subfolder/custom.chunk.0.js.map"
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
			if (el.innerText !== "Delayed 100123") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Chunks & Polyfill", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./chunks-polyfills/myapp.ts"
		},
		polyfills: ["module-window-polyfill", "./polyfills/vanilla-polyfill.js", "./polyfills/typescript-polyfill.ts"]
	});
	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map", "chunk.0.js", "chunk.0.js.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		await sleep(300);
		const found = await page.evaluate(() => {
			if (typeof window.EXAMPLE_FAKE_POLYFILL !== "undefined") {
				return "Fake polyfill exists";
			}
			if (window.EXAMPLE_VANILLA_POLYFILL !== "ok once") {
				return "Missing vanilla polyfill";
			}
			if (window.EXAMPLE_TYPESCRIPT_POLYFILL !== "ok once") {
				return "Missing typescript polyfill";
			}
			if (window.EXAMPLE_MODULE_POLYFILL !== "ok once") {
				return "Missing module polyfill";
			}
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			if (el.innerText !== "Delayed 123 ok once ok once ok once") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Skip Postprocessing", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: "./css-modules/myapp.ts"
		},
		mode: "development",
		skipPostprocess: true
	});

	const expectedFiles = ["myapp.js", "myapp.js.map", "myapp.css", "myapp.css.map"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());
});

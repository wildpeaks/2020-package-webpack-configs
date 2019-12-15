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
const outputFolder = join(__dirname, "../tmp-core");
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

it("Basic", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./basic/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map"];
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
			if (el.innerText !== "Hello World") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Custom filename", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		jsFilename: "subfolder/custom.[name].js",
		mode: "development",
		entry: {
			myapp: "./basic/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "subfolder/custom.myapp.js", "subfolder/custom.myapp.js.map"];
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
			if (el.innerText !== "Hello World") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Multiple independant entries", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			app1: "./multiple/app1.ts",
			app2: "./multiple/app2.ts",
			app3: "./multiple/app3.ts"
		},
		pages: [
			{
				filename: "app1.html",
				chunks: ["app1"]
			},
			{
				filename: "app2.html",
				chunks: ["app2"]
			},
			{
				filename: "app3.html",
				chunks: ["app3"]
			}
		]
	});
	const expectedFiles = [
		"app1.html",
		"app1.css",
		"app1.css.map",
		"app1.js",
		"app1.js.map",
		"app2.html",
		"app2.css",
		"app2.css.map",
		"app2.js",
		"app2.js.map",
		"app3.html",
		"app3.css",
		"app3.css.map",
		"app3.js",
		"app3.js.map"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	let browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/app1.html`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			if (el.innerText !== `APP 1`) {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", `DOM tests for app1`);
	} finally {
		await browser.close();
	}

	browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/app2.html`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			if (el.innerText !== `APP 2`) {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", `DOM tests for app2`);
	} finally {
		await browser.close();
	}

	browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/app3.html`);
		const found = await page.evaluate(() => {
			const el = document.getElementById("hello");
			if (el === null) {
				return "#hello not found";
			}
			if (el.innerText !== `APP 3`) {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", `DOM tests for app3`);
	} finally {
		await browser.close();
	}
});

it("Local Modules", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./local-modules/myapp.ts"
		}
	});
	const expectedFiles = ["index.html", "myapp.js", "myapp.js.map"];
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
			if (el.innerText !== "Hello 100123") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Polyfills", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./polyfills/myapp.ts"
		},
		sourcemaps: false,
		polyfills: ["module-window-polyfill", "./polyfills/vanilla-polyfill.js", "./polyfills/typescript-polyfill.ts"]
	});

	const expectedFiles = ["index.html", "myapp.js"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
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
			if (el.innerText !== "Hello World") {
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Inject Patterns", /* @this */ async function() {
	this.slow(5000);
	this.timeout(5000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		entry: {
			myapp: "./inject/myapp.ts"
		},
		sourcemaps: false,
		polyfills: [],
		publicPath: "/mypublic/",
		assetFilename: "myassets/[name].[ext]",
		injectPatterns: [
			{
				append: false,
				tags: ["thirdparty/three.min.js", "thirdparty/OrbitControls.js"]
			},
			{
				append: true,
				tags: ["override-styles-1.css"]
			},
			{
				append: true,
				publicPath: false,
				tags: ["override-styles-2.css"]
			},
			{
				append: true,
				publicPath: "custom/",
				tags: ["override-styles-3.css"]
			},
			{
				append: false,
				publicPath: false,
				tags: [
					{
						type: "css",
						path: "http://example.com/stylesheet",
						attributes: {
							hello: "example css"
						}
					},
					{
						type: "js",
						path: "http://example.com/script",
						attributes: {
							hello: "example js"
						}
					}
				]
			}
		]
	});
	const expectedFiles = ["index.html", "myapp.js"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on("request", request => {
			const url = request.url();
			if (url.endsWith(".css")) {
				request.respond({
					headers: {"Access-Control-Allow-Origin": "*"},
					content: "text/css",
					body: ".hello{}"
				});
				return;
			}
			if (url.endsWith(".js")) {
				request.respond({
					headers: {"Access-Control-Allow-Origin": "*"},
					content: "text/javascript",
					body: 'console.log("hello");'
				});
				return;
			}
			request.continue();
		});
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			const bodyChildren = document.body.childNodes;
			if (bodyChildren.length !== 6) {
				return `Wrong body.children.length: ${bodyChildren.length}`;
			}

			const headChildren = document.head.childNodes;
			if (headChildren.length !== 9) {
				return `Wrong head.children.length: ${headChildren.length}`;
			}

			const headChild5 = /** @type {Element} */ (headChildren[5]);
			if (headChild5.tagName !== "LINK") {
				return `Wrong head.children[5] tagName: "${headChild5.tagName}"`;
			}
			const headChild5Href = String(headChild5.getAttribute("href"));
			if (headChild5Href !== "http://example.com/stylesheet") {
				return `Wrong head.children[5] href: "${headChild5Href}"`;
			}
			const headChild5Hello = String(headChild5.getAttribute("hello"));
			if (headChild5Hello !== "example css") {
				return `Wrong head.children[5] hello: "${headChild5Hello}"`;
			}

			const headChild6 = /** @type {Element} */ (headChildren[6]);
			if (headChild6.tagName !== "LINK") {
				return `Wrong head.children[6] tagName: "${headChild6.tagName}"`;
			}
			const headChild6Href = String(headChild6.getAttribute("href"));
			if (
				headChild6Href !== "/mypublic/override-styles-1.css" &&
				headChild6Href !== "\\mypublic\\override-styles-1.css"
			) {
				return `Wrong head.children[6] href: "${headChild6Href}"`;
			}

			const headChild7 = /** @type {Element} */ (headChildren[7]);
			if (headChild7.tagName !== "LINK") {
				return `Wrong head.children[7] tagName: "${headChild7.tagName}"`;
			}
			const headChild7Href = String(headChild7.getAttribute("href"));
			if (headChild7Href !== "override-styles-2.css") {
				return `Wrong head.children[7] href: "${headChild7Href}"`;
			}

			const headChild8 = /** @type {Element} */ (headChildren[8]);
			if (headChild8.tagName !== "LINK") {
				return `Wrong head.children[8] tagName: "${headChild8.tagName}"`;
			}
			const headChild8Href = String(headChild8.getAttribute("href"));
			if (
				headChild8Href !== "custom/override-styles-3.css" &&
				headChild8Href !== "custom\\override-styles-3.css"
			) {
				return `Wrong head.children[8] href: "${headChild8Href}"`;
			}

			const bodyChild1 = /** @type {Element} */ (bodyChildren[1]);
			if (bodyChild1.tagName !== "SCRIPT") {
				return `Wrong body.children[1] tagName: "${bodyChild1.tagName}"`;
			}
			const bodyChild1Src = String(bodyChild1.getAttribute("src"));
			if (bodyChild1Src !== "http://example.com/script") {
				return `Wrong body.children[1] src: "${bodyChild1Src}"`;
			}

			const bodyChild2 = /** @type {Element} */ (bodyChildren[2]);
			if (bodyChild2.tagName !== "SCRIPT") {
				return `Wrong body.children[2] tagName: "${bodyChild2.tagName}"`;
			}
			const bodyChild2Src = String(bodyChild2.getAttribute("src"));
			if (
				bodyChild2Src !== "/mypublic/thirdparty/three.min.js" &&
				bodyChild2Src !== "\\mypublic\\thirdparty\\three.min.js"
			) {
				return `Wrong body.children[2] src: "${bodyChild2Src}"`;
			}

			const bodyChild3 = /** @type {Element} */ (bodyChildren[3]);
			if (bodyChild3.tagName !== "SCRIPT") {
				return `Wrong body.children[3] tagName: "${bodyChild3.tagName}"`;
			}
			const bodyChild3Src = String(bodyChild3.getAttribute("src"));
			if (
				bodyChild3Src !== "/mypublic/thirdparty/OrbitControls.js" &&
				bodyChild3Src !== "\\mypublic\\thirdparty\\OrbitControls.js"
			) {
				return `Wrong body.children[3] src: "${bodyChild3Src}"`;
			}

			const bodyChild4 = /** @type {Element} */ (bodyChildren[4]);
			if (bodyChild4.tagName !== "SCRIPT") {
				return `Wrong body.children[4] tagName: "${bodyChild4.tagName}"`;
			}
			const bodyChild4Src = String(bodyChild4.getAttribute("src"));
			if (!bodyChild4Src.startsWith("/mypublic/myapp.js")) {
				return `Wrong body.children[4] src: "${bodyChild4Src}"`;
			}

			return "ok";
		});
		strictEqual(found, "ok", "DOM tests");
	} finally {
		await browser.close();
	}
});

it("Multiple pages", /* @this */ async function() {
	this.slow(10000);
	this.timeout(10000);
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: "development",
		sourcemaps: false,
		polyfills: [],
		entry: {
			app1: "./pages/hello.ts",
			app2: "./pages/world.ts"
		},
		pages: [
			{
				title: "One",
				filename: "page1.html",
				chunks: ["app1"]
			},
			{
				title: "Two",
				filename: "page2.html",
				chunks: ["app2"]
			},
			{
				title: "Three",
				filename: "page3.html"
			},
			{
				title: "Four",
				filename: "subfolder/page4.html"
			},
			{
				title: "Five",
				filename: "page5.html",
				meta: [{param1: "Value 1"}, {param2: "Value 2"}]
			},
			{
				title: "Six",
				filename: "page6.html",
				example: "AAAAA",
				template: join(rootFolder, "pages/template.html")
			}
		]
	});
	const expectedFiles = [
		"app1.js",
		"app2.js",
		"page1.html",
		"page2.html",
		"page3.html",
		"subfolder/page4.html",
		"page5.html",
		"page6.html"
	];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();

		//region page1
		await page.goto(`http://localhost:${port}/page1.html`);
		const found1 = await page.evaluate(() => {
			if (document.title !== "One") {
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById("hello");
			if (el0 === null) {
				return "#hello not found";
			}
			if (el0.innerText !== "TITLE IS One") {
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById("world");
			if (el1 !== null) {
				return "#world should not exist";
			}

			return "ok";
		});
		strictEqual(found1, "ok", "DOM tests (page1)");
		//endregion

		//region page2
		await page.goto(`http://localhost:${port}/page2.html`);
		const found2 = await page.evaluate(() => {
			if (document.title !== "Two") {
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById("hello");
			if (el0 !== null) {
				return "#hello should not exist";
			}

			const el1 = document.getElementById("world");
			if (el1 === null) {
				return "#world not found";
			}
			if (el1.innerText !== "TITLE IS Two") {
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			return "ok";
		});
		strictEqual(found2, "ok", "DOM tests (page2)");
		//endregion

		//region page3
		await page.goto(`http://localhost:${port}/page3.html`);
		const found3 = await page.evaluate(() => {
			if (document.title !== "Three") {
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById("hello");
			if (el0 === null) {
				return "#hello not found";
			}
			if (el0.innerText !== "TITLE IS Three") {
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById("world");
			if (el1 === null) {
				return "#world not found";
			}
			if (el1.innerText !== "TITLE IS Three") {
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			return "ok";
		});
		strictEqual(found3, "ok", "DOM tests (page3)");
		//endregion

		//region page4
		await page.goto(`http://localhost:${port}/subfolder/page4.html`);
		const found4 = await page.evaluate(() => {
			if (document.title !== "Four") {
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById("hello");
			if (el0 === null) {
				return "#hello not found";
			}
			if (el0.innerText !== "TITLE IS Four") {
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById("world");
			if (el1 === null) {
				return "#world not found";
			}
			if (el1.innerText !== "TITLE IS Four") {
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			return "ok";
		});
		strictEqual(found4, "ok", "DOM tests (page4)");
		//endregion

		//region page5
		await page.goto(`http://localhost:${port}/page5.html`);
		const found5 = await page.evaluate(() => {
			if (document.title !== "Five") {
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById("hello");
			if (el0 === null) {
				return "#hello not found";
			}
			if (el0.innerText !== "TITLE IS Five") {
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById("world");
			if (el1 === null) {
				return "#world not found";
			}
			if (el1.innerText !== "TITLE IS Five") {
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			const metas = document.querySelectorAll("meta");
			const metasLength = metas.length;
			if (metasLength < 2) {
				return `Wrong metas.length: ${metasLength}`;
			}

			const meta0 = metas[metasLength - 2];
			const meta0Param = meta0.getAttribute("param1");
			if (meta0Param !== "Value 1") {
				return `Wrong meta0.param1: ${meta0Param}`;
			}

			const meta1 = metas[metasLength - 1];
			const meta1Param = meta1.getAttribute("param2");
			if (meta1Param !== "Value 2") {
				return `Wrong meta1.param2: ${meta1Param}`;
			}

			return "ok";
		});
		strictEqual(found5, "ok", "DOM tests (page5)");
		//endregion

		//region page6
		await page.goto(`http://localhost:${port}/page6.html`);
		const found6 = await page.evaluate(() => {
			if (document.title !== "Six - Customized") {
				return `Wrong title: "${document.title}"`;
			}
			if (document.body.className !== "customized") {
				return `Wrong body.className: "${document.body.className}"`;
			}

			const divs = document.querySelectorAll("div");
			if (divs.length !== 3) {
				return `Wrong divs.length: ${divs.length}`;
			}

			const div0 = /** @type {Element} */ (divs[0]);
			if (div0.textContent !== "Custom Option: AAAAA") {
				return `Wrong divs[0].textContent: "${div0.textContent}"`;
			}

			const div1 = /** @type {Element} */ (divs[1]);
			if (div1.textContent !== "TITLE IS Six - Customized") {
				return `Wrong divs[1].textContent: "${div1.textContent}"`;
			}
			const div1Id = div1.getAttribute("id");
			if (div1Id !== "hello") {
				return `Wrong divs[1].id: "${div1Id}"`;
			}

			const div2 = /** @type {Element} */ (divs[2]);
			if (div2.textContent !== "TITLE IS Six - Customized") {
				return `Wrong divs[2].textContent: "${div2.textContent}"`;
			}
			const div2Id = div2.getAttribute("id");
			if (div2Id !== "world") {
				return `Wrong divs[2].id: "${div2Id}"`;
			}

			return "ok";
		});
		strictEqual(found6, "ok", "DOM tests (page6)");
		//endregion
	} finally {
		await browser.close();
	}
});

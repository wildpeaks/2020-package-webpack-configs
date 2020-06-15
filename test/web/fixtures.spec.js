/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {strictEqual, deepStrictEqual} = require("assert");
const {readFileSync} = require("fs");
const {copySync, removeSync} = require("fs-extra");
const express = require("express");
const {chromium, firefox, webkit} = require("playwright");
const {compileFixture} = require("../shared");
const snapshotScript = require.resolve("@wildpeaks/snapshot-dom/lib/browser.js");

const dist = join(__dirname, `../../tmp/dist`);

function sleep(duration) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}


let server;
let port = 0;
function startExpress() {
	return new Promise((resolve) => {
		const app = express();
		app.use(express.static(dist));
		server = app.listen(0, () => {
			resolve(server.address().port);
		});
	});
}
function stopExpress() {
	return new Promise((resolve) => {
		server.close(() => {
			resolve();
		});
	});
}
before(async function () {
	// prettier-ignore
	removeSync(
		join(__dirname, `../../tmp/node_modules/@wildpeaks/webpack-config-web`)
	);
	copySync(
		join(__dirname, `../../packages/webpack-config-web`),
		join(__dirname, `../../tmp/node_modules/@wildpeaks/webpack-config-web`)
	);
	// prettier-ignore
	copySync(
		join(__dirname, "tsconfig.json"),
		join(__dirname, "../../tmp/tsconfig.json")
	);
	port = await startExpress();
	// localhost = `http://localhost:${port}/`;
});
after(async function () {
	await stopExpress();
});


async function testCompile({id, sources, compiled, expectBuildError, extras}) {
	const fixtureFolder = join(__dirname, id);
	const {filesBefore, errors, filesAfter} = await compileFixture(fixtureFolder, extras);

	let expectBefore = sources;
	if (extras) {
		expectBefore = expectBefore.concat(["dist/extra-1.txt", "dist/extra-2.js", "dist/extra-3.ts"]);
	}
	expectBefore = expectBefore.sort();
	if (expectBuildError) {
		if (errors.length === 0) {
			throw new Error("Expected a build error");
		}
		return [];
	}
	deepStrictEqual(filesBefore, expectBefore, "Before Webpack");
	deepStrictEqual(errors, [], "No Webpack errors");

	if (typeof compiled !== "undefined") {
		const expectAfter = sources.concat(compiled).sort();
		deepStrictEqual(filesAfter, expectAfter, "After Webpack");
	}
	return filesAfter;
}

async function getSnapshot(host, subpath = "") {
	let tree;
	const browser = await host.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${port}/${subpath}`, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		tree = await page.evaluate(() => window.snapshotToJSON(document.getElementById("mocha")));
	} finally {
		await browser.close();
	}
	if (tree === null || typeof tree !== "object") {
		throw new Error("Failed to snapshot #mocha element");
	}
	return tree.childNodes;
}

async function getSnapshotColor(host) {
	let color;
	const browser = await host.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${port}/`, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		color = await page.evaluate(() => {
			const el = document.getElementById("mocha");
			if (el === null) {
				return "#mocha not found";
			}
			const computed = window.getComputedStyle(el);
			return computed.getPropertyValue("color");
		});
	} finally {
		await browser.close();
	}
	return color;
}

async function getSnapshotMultiple(host, subpath = "") {
	let tree1;
	let tree2;
	const browser = await host.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${port}/${subpath}`, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		tree1 = await page.evaluate(() => {
			const el1 = document.getElementById("mocha1");
			if (el1) {
				return window.snapshotToJSON(el1).childNodes;
			}
			return "NOT FOUND";
		});
		tree2 = await page.evaluate(() => {
			const el2 = document.getElementById("mocha2");
			if (el2) {
				return window.snapshotToJSON(el2).childNodes;
			}
			return "NOT FOUND";
		});
	} finally {
		await browser.close();
	}
	return {
		mocha1: tree1,
		mocha2: tree2
	};
}

async function getSnapshotMultipleColor(host) {
	let color1;
	let color2;
	const browser = await host.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${port}/`, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		color1 = await page.evaluate(() => {
			const computed = window.getComputedStyle(document.body);
			return computed.getPropertyValue("color");
		});
		color2 = await page.evaluate(() => {
			const el = document.getElementById("mocha");
			if (el === null) {
				return "#mocha not found";
			}
			const computed = window.getComputedStyle(el);
			return computed.getPropertyValue("color");
		});
	} finally {
		await browser.close();
	}
	return {
		body: color1,
		mocha: color2
	};
}

async function getSnapshotImage(host) {
	let color;
	const browser = await host.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${port}/`, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		color = await page.evaluate(() => {
			const el = document.getElementById("mocha");
			if (el === null) {
				return "#mocha not found";
			}
			const computed = window.getComputedStyle(el);
			return computed.getPropertyValue("background-image");
		});
	} finally {
		await browser.close();
	}
	return color;
}

//---------------------------------------------------------------------------//
// Basic
//---------------------------------------------------------------------------//
async function testBasic(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "Basic"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Basic", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "basic",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-basic.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testBasic(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testBasic(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testBasic(webkit);
	});
});


//---------------------------------------------------------------------------//
// Custom Filename
//---------------------------------------------------------------------------//
async function testCustomFilename(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "Basic Filename"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Custom Filename", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "basic_filename",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/subfolder/custom.app-basic-filename.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCustomFilename(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCustomFilename(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCustomFilename(webkit);
	});
});


//---------------------------------------------------------------------------//
// Multiple entries
//---------------------------------------------------------------------------//
async function testMultipleEntries(host) {
	const actual1 = await getSnapshot(host, "app1.html");
	const actual2 = await getSnapshot(host, "app2.html");
	const actual3 = await getSnapshot(host, "app3.html");
	const expected1 = [{nodeName: "#text", nodeValue: "Multiple 1"}];
	const expected2 = [{nodeName: "#text", nodeValue: "Multiple 2"}];
	const expected3 = [{nodeName: "#text", nodeValue: "Multiple 3"}];
	deepStrictEqual(actual1, expected1, "DOM structure");
	deepStrictEqual(actual2, expected2, "DOM structure");
	deepStrictEqual(actual3, expected3, "DOM structure");
}
describe("Multiple entries", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
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
				"dist/app1.html",
				"dist/app2.html",
				"dist/app3.html",
				"dist/app-multiple-1.js",
				"dist/app-multiple-2.js",
				"dist/app-multiple-3.js"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(15000);
		this.timeout(45000);
		await testMultipleEntries(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(15000);
		this.timeout(45000);
		await testMultipleEntries(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(15000);
		this.timeout(45000);
		await testMultipleEntries(webkit);
	});
});


//---------------------------------------------------------------------------//
// Polyfills
//---------------------------------------------------------------------------//
async function testPolyfills(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "Polyfills"
		},
		{
			childNodes: [
				{
					nodeName: "#text",
					nodeValue: "EXAMPLE_FAKE_POLYFILL undefined"
				}
			],
			tagName: "div"
		},
		{
			childNodes: [
				{
					nodeName: "#text",
					nodeValue: "EXAMPLE_VANILLA_POLYFILL ok once"
				}
			],
			tagName: "div"
		},
		{
			childNodes: [
				{
					nodeName: "#text",
					nodeValue: "EXAMPLE_TYPESCRIPT_POLYFILL ok once"
				}
			],
			tagName: "div"
		},
		{
			childNodes: [
				{
					nodeName: "#text",
					nodeValue: "EXAMPLE_MODULE_POLYFILL ok once"
				}
			],
			tagName: "div"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Polyfills", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "polyfills",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/thirdparty/typescript-polyfill.ts",
				"src/thirdparty/vanilla-polyfill.js"
			],
			compiled: ["dist/index.html", "dist/app-polyfills.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testPolyfills(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testPolyfills(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testPolyfills(webkit);
	});
});


//---------------------------------------------------------------------------//
// Inject Patterns
//---------------------------------------------------------------------------//
async function testInject(host) {
	let tags;
	const browser = await host.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(`http://localhost:${port}/`, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		tags = await page.evaluate(() => {
			const children = [...document.getElementsByTagName("link"), ...document.getElementsByTagName("script")];
			return children.map(window.snapshotToJSON);
		});
	} finally {
		await browser.close();
	}
	tags[4] = "REMOVED";
	deepStrictEqual(tags, [
		{
			tagName: "link",
			attributes: {
				href: "http://example.com/stylesheet",
				rel: "stylesheet",
				hello: "example css"
			}
		},
		{
			tagName: "link",
			attributes: {
				href: "/mypublic/override-styles-1.css",
				rel: "stylesheet"
			}
		},
		{
			tagName: "link",
			attributes: {
				href: "override-styles-2.css",
				rel: "stylesheet"
			}
		},
		{
			tagName: "link",
			attributes: {
				href: "custom/override-styles-3.css",
				rel: "stylesheet"
			}
		},
		"REMOVED",
		{
			tagName: "script",
			attributes: {
				src: "http://example.com/script",
				hello: "example js"
			}
		},
		{
			tagName: "script",
			attributes: {
				src: "/mypublic/thirdparty/three.min.js"
			}
		},
		{
			tagName: "script",
			attributes: {
				src: "/mypublic/thirdparty/OrbitControls.js"
			}
		},
		{
			tagName: "script",
			attributes: {
				src: "/mypublic/app-inject.js"
			}
		}
	]);
}
describe("Inject Patterns", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "inject",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-inject.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testInject(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testInject(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testInject(webkit);
	});
});


//---------------------------------------------------------------------------//
// Multiple pages
//---------------------------------------------------------------------------//
async function testMultiplePages(host) {
	const actual1 = await getSnapshotMultiple(host, "page1.html");
	const expected1 = {
		mocha1: [{nodeName: "#text", nodeValue: "FIRST One"}],
		mocha2: "NOT FOUND"
	};
	deepStrictEqual(actual1, expected1, "page1.html");

	const actual2 = await getSnapshotMultiple(host, "page2.html");
	const expected2 = {
		mocha1: "NOT FOUND",
		mocha2: [{nodeName: "#text", nodeValue: "SECOND Two"}]
	};
	deepStrictEqual(actual2, expected2, "page2.html");

	const actual3 = await getSnapshotMultiple(host, "page3.html");
	const expected3 = {
		mocha1: [{nodeName: "#text", nodeValue: "FIRST Three"}],
		mocha2: [{nodeName: "#text", nodeValue: "SECOND Three"}]
	};
	deepStrictEqual(actual3, expected3, "page3.html");

	const actual4 = await getSnapshotMultiple(host, "subfolder/page4.html");
	const expected4 = {
		mocha1: [{nodeName: "#text", nodeValue: "FIRST Four"}],
		mocha2: [{nodeName: "#text", nodeValue: "SECOND Four"}]
	};
	deepStrictEqual(actual4, expected4, "page4.html");

	let actual5;
	const browser5 = await host.launch();
	try {
		const ctx5 = await browser5.newContext();
		const page5 = await ctx5.newPage();
		await page5.goto(`http://localhost:${port}/page5.html`, {waitUntil: "networkidle"});
		await sleep(300);
		await page5.addScriptTag({path: snapshotScript});
		await sleep(300);
		actual5 = await page5.evaluate(() => {
			const children = [...document.getElementsByTagName("meta")];
			return children.map(window.snapshotToJSON);
		});
	} finally {
		await browser5.close();
	}
	const expected5 = [
		{
			attributes: {
				charset: "utf-8"
			},
			tagName: "meta"
		},
		{
			attributes: {
				param1: "Value 1"
			},
			tagName: "meta"
		},
		{
			attributes: {
				param2: "Value 2"
			},
			tagName: "meta"
		},
		{
			attributes: {
				content: "width=device-width, initial-scale=1",
				name: "viewport"
			},
			tagName: "meta"
		}
	];
	deepStrictEqual(actual5, expected5, "page5.html");

	const actual6 = await getSnapshotMultiple(host, "page6.html");
	const expected6 = {
		mocha1: [{nodeName: "#text", nodeValue: "FIRST Six - Custom Option: AAAAA"}],
		mocha2: [{nodeName: "#text", nodeValue: "SECOND Six - Custom Option: AAAAA"}]
	};
	deepStrictEqual(actual6, expected6, "page6.html");
}
describe("Multiple pages", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "multiple_pages",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/template.html",
				"src/first.ts",
				"src/second.ts"
			],
			compiled: [
				"dist/app-pages-1.js",
				"dist/app-pages-2.js",
				"dist/page1.html",
				"dist/page2.html",
				"dist/page3.html",
				"dist/subfolder/page4.html",
				"dist/page5.html",
				"dist/page6.html"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(30000);
		this.timeout(60000);
		await testMultiplePages(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(30000);
		this.timeout(60000);
		await testMultiplePages(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(30000);
		this.timeout(60000);
		await testMultiplePages(webkit);
	});
});


//---------------------------------------------------------------------------//
// Assets
//---------------------------------------------------------------------------//
async function testAssets(host) {
	const actual = await getSnapshot(host);
	strictEqual(actual.length, 8, "#mocha.childNodes.length");
	deepStrictEqual(actual[0].tagName, "img");
	deepStrictEqual(actual[2].tagName, "img");
	deepStrictEqual(actual[0].attributes.src.startsWith("data:image/jpeg;base64"), true);
	deepStrictEqual(actual[2].attributes.src.startsWith("data:image/png;base64"), true);
	deepStrictEqual(actual[1], {attributes: {src: "/myimages/large.jpg"}, tagName: "img"});
	deepStrictEqual(actual[3], {attributes: {src: "/myimages/large.png"}, tagName: "img"});
	deepStrictEqual(actual[4], {attributes: {src: "/myimages/small.gif"}, tagName: "img"});
	deepStrictEqual(actual[5], {attributes: {src: "/myimages/large.gif"}, tagName: "img"});
	deepStrictEqual(actual[6], {
		childNodes: [{nodeName: "#text", nodeValue: "/myimages/small.json"}],
		tagName: "div"
	});
	deepStrictEqual(actual[7], {
		childNodes: [{nodeName: "#text", nodeValue: "/myimages/large.json"}],
		tagName: "div"
	});
}
describe("Assets", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "assets",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/large.gif",
				"src/large.jpg",
				"src/large.json",
				"src/large.png",
				"src/small.gif",
				"src/small.jpg",
				"src/small.json",
				"src/small.png"
			],
			compiled: [
				"dist/index.html",
				"dist/app-assets.js",
				"dist/myimages/large.jpg",
				"dist/myimages/large.png",
				"dist/myimages/small.gif",
				"dist/myimages/large.gif",
				"dist/myimages/small.json",
				"dist/myimages/large.json"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAssets(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAssets(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAssets(webkit);
	});
});


//---------------------------------------------------------------------------//
// Copy Patterns
//---------------------------------------------------------------------------//
describe("Copy Patterns", function () {
	it("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "copy_patterns",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/file9",
				"src/myfolder-1/file1.example-1",
				"src/myfolder-1/file2.example-1",
				"src/myfolder-2/hello/file3.example-1",
				"src/myfolder-2/hello/file4.example-2",
				"src/myfolder-2/hello/file5.example-1",
				"src/myfolder-2/hello/file6.example-2",
				"src/myfolder-3.ext/file7.example",
				"src/myfolder-3.ext/file8.example"
			],
			compiled: [
				"dist/index.html",
				"dist/app-copy-patterns.js",
				"dist/copied-1/file1.example-1",
				"dist/copied-1/file2.example-1",
				"dist/copied-2/file1.example-1",
				"dist/copied-2/file2.example-1",
				"dist/copied-3/file1.example-1",
				"dist/copied-3/file2.example-1",
				"dist/copied-4/subfolder/file1.example-1",
				"dist/copied-4/subfolder/file2.example-1",
				"dist/copied-5/src/myfolder-2/hello/file3.example-1",
				"dist/copied-5/src/myfolder-2/hello/file5.example-1",
				"dist/copied-6/hello/file3.example-1",
				"dist/copied-6/hello/file5.example-1",
				"dist/copied-7/file7.example",
				"dist/copied-7/file8.example",
				"dist/copied-8/file9"
			]
		});
	});
});


//---------------------------------------------------------------------------//
// Assets: Raw imports
//---------------------------------------------------------------------------//
async function testRawImport(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			attributes: {
				id: "hello1"
			},
			childNodes: [
				{
					nodeName: "#text",
					nodeValue: "Hello world\n"
				}
			],
			tagName: "div"
		},
		{
			attributes: {
				id: "hello2"
			},
			childNodes: [
				{
					nodeName: "#text",
					nodeValue: "Hello {{ world }}\n"
				}
			],
			tagName: "div"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Raw imports", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "raw_imports",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/file1.txt",
				"src/file2.liquid"
			],
			compiled: ["dist/index.html", "dist/app-raw-imports.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testRawImport(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testRawImport(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testRawImport(webkit);
	});
});


//---------------------------------------------------------------------------//
// Skip Reset: False
//---------------------------------------------------------------------------//
async function testSkipResetFalse(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "Skip False"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Skip Reset: False", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "skip_reset_false",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			extras: true,
			compiled: ["dist/index.html", "dist/app-skip-false.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testSkipResetFalse(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testSkipResetFalse(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testSkipResetFalse(webkit);
	});
});


//---------------------------------------------------------------------------//
// Skip Reset: True
//---------------------------------------------------------------------------//
async function testSkipResetTrue(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "Skip True"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Skip Reset: True", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "skip_reset_true",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			extras: true,
			compiled: [
				"dist/index.html",
				"dist/app-skip-true.js",
				"dist/extra-1.txt",
				"dist/extra-2.js",
				"dist/extra-3.ts"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testSkipResetTrue(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testSkipResetTrue(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testSkipResetTrue(webkit);
	});
});


//---------------------------------------------------------------------------//
// CSS Modules
//---------------------------------------------------------------------------//
async function testCssModules(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 128, 0)");
}
describe("CSS Modules", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "css_modules",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.css"
			],
			compiled: ["dist/index.html", "dist/app-css-modules.js", "dist/app-css-modules.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssModules(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssModules(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssModules(webkit);
	});
});


//---------------------------------------------------------------------------//
// CSS Modules: Custom Filename
//---------------------------------------------------------------------------//
async function testCssModulesFilename(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 128, 0)");
}
describe("CSS Modules: Custom Filename", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "css_modules_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.css"
			],
			compiled: [
				"dist/index.html",
				"dist/app-css-modules-filename.js",
				"dist/subfolder/custom.app-css-modules-filename.css"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssModulesFilename(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssModulesFilename(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssModulesFilename(webkit);
	});
});


//---------------------------------------------------------------------------//
// CSS without CSS Modules
//---------------------------------------------------------------------------//
async function testCssWithoutModules(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 128, 0)");
}
describe("CSS without CSS Modules", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "css_no_modules",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.css"
			],
			compiled: ["dist/index.html", "dist/app-css-no-modules.js", "dist/app-css-no-modules.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssWithoutModules(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssWithoutModules(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssWithoutModules(webkit);
	});
});


//---------------------------------------------------------------------------//
// CSS Reset
//---------------------------------------------------------------------------//
async function testCssReset(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 128, 0)");
}
describe("CSS Reset", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "css_reset",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/reset.css"],
			compiled: ["dist/index.html", "dist/app-css-reset.js", "dist/app-css-reset.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssReset(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssReset(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssReset(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Reset
//---------------------------------------------------------------------------//
async function testScssReset(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 128, 0)");
}
describe("SCSS Reset", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_reset",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/reset.scss"],
			compiled: ["dist/index.html", "dist/app-scss-reset.js", "dist/app-scss-reset.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssReset(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssReset(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssReset(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Global Import
//---------------------------------------------------------------------------//
async function testScssGlobalImport(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 128, 0)");
}
describe("SCSS Global Import", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_global_import",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/reset.scss",
				"src/variables.scss"
			],
			compiled: ["dist/index.html", "dist/app-scss-global-import.js", "dist/app-scss-global-import.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssGlobalImport(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssGlobalImport(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssGlobalImport(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Global Define
//---------------------------------------------------------------------------//
async function testScssGlobalDefine(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(128, 128, 0)");
}
describe("SCSS Global Define", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_global_define",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/reset.scss"],
			compiled: ["dist/index.html", "dist/app-scss-global-define.js", "dist/app-scss-global-define.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssGlobalDefine(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssGlobalDefine(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssGlobalDefine(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Basic
//---------------------------------------------------------------------------//
async function testScssBasic(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 128, 255)");
}
describe("SCSS Basic", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_basic",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.scss"
			],
			compiled: ["dist/index.html", "dist/app-scss-basic.js", "dist/app-scss-basic.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssBasic(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssBasic(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssBasic(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Import File
//---------------------------------------------------------------------------//
async function testScssImportFile(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 0, 255)");
}
describe("SCSS Import File", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_import_file",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.scss",
				"src/theme-blue.scss"
			],
			compiled: ["dist/index.html", "dist/app-scss-import-file.js", "dist/app-scss-import-file.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImportFile(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImportFile(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImportFile(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Import Module
//---------------------------------------------------------------------------//
async function testScssImportModule(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 255, 0)");
}
describe("SCSS Import Module", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_import_module",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.scss"
			],
			compiled: ["dist/index.html", "dist/app-scss-import-module.js", "dist/app-scss-import-module.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImportModule(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImportModule(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImportModule(webkit);
	});
});


//---------------------------------------------------------------------------//
// CSS Chunks
//---------------------------------------------------------------------------//
async function testCssChunks(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 0, 255)");
}
describe("CSS Chunks", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "css_chunks",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/async.css",
				"src/sync.css"
			],
			compiled: [
				"dist/index.html",
				"dist/app-css-chunks.js",
				"dist/app-css-chunks.css",
				"dist/chunk.0.js",
				"dist/chunk.0.css"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssChunks(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssChunks(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssChunks(webkit);
	});
});


//---------------------------------------------------------------------------//
// CSS Chunks Filename
//---------------------------------------------------------------------------//
async function testCssChunksFilename(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 0, 255)");
}
describe("CSS Chunks Filename", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "css_chunks_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/async.css",
				"src/sync.css"
			],
			compiled: [
				"dist/index.html",
				"dist/app-css-chunks-filename.js",
				"dist/app-css-chunks-filename.css",
				"dist/chunk.0.js",
				"dist/subfolder/custom.chunk.0.css"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssChunksFilename(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssChunksFilename(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssChunksFilename(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Chunks
//---------------------------------------------------------------------------//
async function testScssChunks(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 0, 255)");
}
describe("SCSS Chunks", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_chunks",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/async.scss",
				"src/sync.scss"
			],
			compiled: [
				"dist/index.html",
				"dist/app-scss-chunks.js",
				"dist/app-scss-chunks.css",
				"dist/chunk.0.js",
				"dist/chunk.0.css"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunks(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunks(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunks(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Chunks: Custom Filename
//---------------------------------------------------------------------------//
async function testScssChunksFilename(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 0, 255)");
}
describe("SCSS Chunks: Custom Filename", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_chunks_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/async.scss",
				"src/sync.scss"
			],
			compiled: [
				"dist/index.html",
				"dist/app-scss-chunks-filename.js",
				"dist/app-scss-chunks-filename.css",
				"dist/chunk.0.js",
				"dist/subfolder/custom.chunk.0.css"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunksFilename(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunksFilename(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunksFilename(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Chunks & Variables
//---------------------------------------------------------------------------//
async function testScssChunksVariables(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color, "rgb(0, 0, 128)");
}
describe("SCSS Chunks & Variables", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_chunks_variables",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/async.scss",
				"src/sync.scss"
			],
			compiled: [
				"dist/index.html",
				"dist/app-scss-chunks-variables.js",
				"dist/app-scss-chunks-variables.css",
				"dist/chunk.0.js",
				"dist/chunk.0.css"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunksVariables(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunksVariables(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssChunksVariables(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Data
//---------------------------------------------------------------------------//
async function testScssData(host) {
	const color = await getSnapshotColor(host);
	strictEqual(color !== "rgb(0, 255, 0)", true, "Inline style");
}
describe("SCSS Data", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_data",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: [
				"dist/index.html",
				"dist/app-scss-data.js"

				// Data alone isn't enough to produce a .css: at least one entry must contain
				// an import or polyfill to a stylesheet, otherwise the loader skips
				// extracting styles, unfortunately.
				// "dist/app-scss-data.css"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssData(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssData(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssData(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Data & Import
//---------------------------------------------------------------------------//
async function testScssDataImport(host) {
	const colors = await getSnapshotMultipleColor(host);
	deepStrictEqual(colors, {body: "rgb(255, 0, 0)", mocha: "rgb(0, 0, 255)"});
}
describe("SCSS Data & Import", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_data_import",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.scss"
			],
			compiled: ["dist/index.html", "dist/app-scss-data-import.js", "dist/app-scss-data-import.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssDataImport(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssDataImport(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssDataImport(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS Data Function
//---------------------------------------------------------------------------//
async function testScssDataFunction(host) {
	const colors = await getSnapshotMultipleColor(host);
	deepStrictEqual(colors, {body: "rgb(255, 0, 0)", mocha: "rgb(0, 0, 255)"});
}
describe("SCSS Data Function", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_data_function",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.scss"
			],
			compiled: ["dist/index.html", "dist/app-scss-data-function.js", "dist/app-scss-data-function.css"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssDataFunction(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssDataFunction(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssDataFunction(webkit);
	});
});


//---------------------------------------------------------------------------//
// SCSS & Image
//---------------------------------------------------------------------------//
async function testScssImage(host) {
	const actual = await getSnapshotImage(host);
	strictEqual(actual, `url("http://localhost:${port}/assets/large.jpg")`);
}
describe("SCSS & Image", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "scss_image",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.scss",
				"src/large.jpg"
			],
			compiled: ["dist/index.html", "dist/app-scss-image.js", "dist/app-scss-image.css", "dist/assets/large.jpg"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImage(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImage(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testScssImage(webkit);
	});
});


//---------------------------------------------------------------------------//
// CSS & Image
//---------------------------------------------------------------------------//
async function testCssImage(host) {
	const actual = await getSnapshotImage(host);
	strictEqual(actual, `url("http://localhost:${port}/assets/large.jpg")`);
}
describe("CSS & Image", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "css_image",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.css",
				"src/large.jpg"
			],
			compiled: ["dist/index.html", "dist/app-css-image.js", "dist/app-css-image.css", "dist/assets/large.jpg"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssImage(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssImage(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCssImage(webkit);
	});
});


//---------------------------------------------------------------------------//
// Sourcemaps
//---------------------------------------------------------------------------//
describe("Sourcemaps", function () {
	it("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "sourcemaps",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.css"
			],
			compiled: [
				"dist/index.html",
				"dist/app-sourcemaps.js",
				"dist/app-sourcemaps.js.map",
				"dist/app-sourcemaps.css",
				"dist/app-sourcemaps.css.map"
			]
		});
	});
});


//---------------------------------------------------------------------------//
// Production Mode
//---------------------------------------------------------------------------//
async function testProduction(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "Production"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Production Mode", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);

		const sources = [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/application.css"
		];
		const compiled = ["dist/index.html", "dist/%%HASH%%.app-production.js", "dist/%%HASH%%.app-production.css"];
		const filesAfter = await testCompile({
			id: "production",
			sources
		});

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

		const cssRaw = readFileSync(join(dist, `${hash}.app-production.css`), "utf8");
		if (/^.([^{}]+){color:green}/.exec(cssRaw) === null) {
			throw new Error("CSS is not minified");
		}

		const jsRaw = readFileSync(join(dist, `${hash}.app-production.js`), "utf8");
		if (!jsRaw.startsWith("!function(")) {
			throw new Error("JS is not minified");
		}
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProduction(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProduction(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProduction(webkit);
	});
});


//---------------------------------------------------------------------------//
// Production mode & Skip hashes
//---------------------------------------------------------------------------//
async function testProductionSkipHashes(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "Production"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Production mode & Skip hashes", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);

		const sources = [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/application.css"
		];
		const compiled = [
			"dist/index.html",
			"dist/app-production-skip-hashes.js",
			"dist/app-production-skip-hashes.css"
		];
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

		const cssRaw = readFileSync(join(dist, "app-production-skip-hashes.css"), "utf8");
		if (/^.([^{}]+){color:green}/.exec(cssRaw) === null) {
			throw new Error("CSS is not minified");
		}

		const jsRaw = readFileSync(join(dist, "app-production-skip-hashes.js"), "utf8");
		if (!jsRaw.startsWith("!function(")) {
			throw new Error("JS is not minified");
		}
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProductionSkipHashes(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProductionSkipHashes(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProductionSkipHashes(webkit);
	});
});


//---------------------------------------------------------------------------//
// Chunks
//---------------------------------------------------------------------------//
async function testChunks(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "CHUNKS delayed 100123"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Chunks", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "chunks",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/modules/mymodule.ts"
			],
			compiled: ["dist/index.html", "dist/app-chunks.js", "dist/chunk.0.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunks(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunks(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunks(webkit);
	});
});


//---------------------------------------------------------------------------//
// Chunks: Custom Filename
//---------------------------------------------------------------------------//
async function testChunksFilename(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "CHUNKS FILENAME delayed 100123"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Chunks: Custom Filename", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "chunks_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/modules/mymodule.ts"
			],
			compiled: ["dist/index.html", "dist/app-chunks-filename.js", "dist/subfolder/custom.chunk.0.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunksFilename(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunksFilename(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunksFilename(webkit);
	});
});


//---------------------------------------------------------------------------//
// Chunks: Polyfills
//---------------------------------------------------------------------------//
async function testChunksPolyfills(host) {
	const actual = await getSnapshotMultiple(host);
	const expected = {
		mocha1: [
			{
				nodeName: "#text",
				nodeValue: "CHUNKS POLYFILLS undefined ok once ok once ok once"
			}
		],
		mocha2: [
			{
				nodeName: "#text",
				nodeValue: "Delayed 123 ok once ok once ok once"
			}
		]
	};
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Chunks: Polyfills", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "chunks_polyfills",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/modules/mymodule.ts",
				"src/thirdparty/typescript-polyfill.ts",
				"src/thirdparty/vanilla-polyfill.js"
			],
			compiled: ["dist/index.html", "dist/app-chunks-polyfills.js", "dist/chunk.0.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunksPolyfills(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunksPolyfills(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testChunksPolyfills(webkit);
	});
});


//---------------------------------------------------------------------------//
// Skip Postprocessing
//---------------------------------------------------------------------------//
describe("Skip Postprocessing", function () {
	it("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "skip_processing",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-skip-postprocessing.js"]
		});
	});
});


//---------------------------------------------------------------------------//
// Webworkers: Basic
//---------------------------------------------------------------------------//
async function testWebworkerBasic(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "WORKER replies HELLO"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Webworkers: Basic", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "webworker",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/myworker.webworker.ts"
			],
			compiled: ["dist/index.html", "dist/app-webworker.js", "dist/myworker.webworker.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerBasic(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerBasic(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerBasic(webkit);
	});
});


//---------------------------------------------------------------------------//
// Webworkers: Custom filename
//---------------------------------------------------------------------------//
async function testWebworkerFilename(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "WORKER replies HELLO"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Webworkers: Custom filename", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "webworker_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/myworker.webworker.ts"
			],
			compiled: [
				"dist/index.html",
				"dist/app-webworker-filename.js",
				"dist/subfolder/custom.myworker.webworker.js"
			]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerFilename(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerFilename(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerFilename(webkit);
	});
});


//---------------------------------------------------------------------------//
// Webworkers: Polyfills
//---------------------------------------------------------------------------//
async function testWebworkerPolyfills(host) {
	const actual = await getSnapshotMultiple(host);
	const expected = {
		mocha1: [
			{
				nodeName: "#text",
				nodeValue: "BOTH once undefined MAIN once undefined"
			}
		],
		mocha2: [
			{
				nodeName: "#text",
				nodeValue: "BOTH once WORKER once undefined MODULE once"
			}
		]
	};
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Webworkers: Polyfills", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "webworker_polyfills",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/application.webworker.ts",
				"src/both.polyfill.ts",
				"src/only-main.polyfill.ts",
				"src/only-worker.polyfill.ts"
			],
			compiled: ["dist/index.html", "dist/app-webworker-polyfills.js", "dist/application.webworker.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerPolyfills(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerPolyfills(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerPolyfills(webkit);
	});
});


//---------------------------------------------------------------------------//
// Webworkers: No export {}
//---------------------------------------------------------------------------//
async function testWebworkerNoExportObject(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "WORKER replies HELLO"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Webworkers: No export {}", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "webworker",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/myworker.webworker.ts"
			],
			compiled: ["dist/index.html", "dist/app-webworker.js", "dist/myworker.webworker.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerNoExportObject(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerNoExportObject(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testWebworkerNoExportObject(webkit);
	});
});


//---------------------------------------------------------------------------//
// Node features
//---------------------------------------------------------------------------//
describe("Fails: fs", function () {
	it("Expect build error", /* @this */ async function () {
		// Note that package "native-url" would produce smaller bundles
		// than the polyfill Webpack uses.
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "node_fs",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			expectBuildError: true
		});
	});
});


//---------------------------------------------------------------------------//
// Mocks: __dirname
//---------------------------------------------------------------------------//
async function testMockDirname(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "NODE DIRNAME /"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Mocks: __dirname", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "node_dirname",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-dirname.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testMockDirname(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testMockDirname(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testMockDirname(webkit);
	});
});


//---------------------------------------------------------------------------//
// Mocks: process.cwd()
//---------------------------------------------------------------------------//
async function testProcessCwd(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "NODE CWD /"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Mocks: process.cwd()", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "node_cwd",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-cwd.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProcessCwd(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProcessCwd(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testProcessCwd(webkit);
	});
});


//---------------------------------------------------------------------------//
// Accepts: url
//---------------------------------------------------------------------------//
async function testAcceptUrl(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "NODE URL https://example.com"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Accepts: url", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		// Note that package "native-url" would produce smaller bundles
		// than the polyfill Webpack uses.
		await testCompile({
			id: "node_url",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-url.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptUrl(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptUrl(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptUrl(webkit);
	});
});


//---------------------------------------------------------------------------//
// Accepts: path
//---------------------------------------------------------------------------//
async function testAcceptPath(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "NODE PATH /hello/world.txt"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Accepts: path", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "node_path",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-path.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptPath(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptPath(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptPath(webkit);
	});
});


//---------------------------------------------------------------------------//
// Accepts: assert
//---------------------------------------------------------------------------//
async function testAcceptAssert(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "NODE ASSERT false true"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Accepts: assert", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testCompile({
			id: "node_assert",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-assert.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptAssert(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptAssert(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testAcceptAssert(webkit);
	});
});


//---------------------------------------------------------------------------//
// Externals: undefined
//---------------------------------------------------------------------------//
async function testExternalsUndefined(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "EXTERNALS UNDEFINED MODULE1 MODULE2"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Externals: undefined", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
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
			compiled: ["dist/index.html", "dist/app-externals-undefined.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testExternalsUndefined(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testExternalsUndefined(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testExternalsUndefined(webkit);
	});
});


//---------------------------------------------------------------------------//
// Externals: Globals
//---------------------------------------------------------------------------//
async function testExternalsGlobals(host) {
	const actual = await getSnapshot(host);
	const expected = [
		{
			nodeName: "#text",
			nodeValue: "EXTERNALS GLOBALS GLOBAL1 GLOBAL2"
		}
	];
	deepStrictEqual(actual, expected, "DOM structure");
}
describe("Externals: Globals", function () {
	before("Compile", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
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
			compiled: ["dist/index.html", "dist/app-externals-globals.js"]
		});
	});
	it("Chromium", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testExternalsGlobals(chromium);
	});
	it("Firefox", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testExternalsGlobals(firefox);
	});
	it("Webkit", /* @this */ async function () {
		this.slow(5000);
		this.timeout(15000);
		await testExternalsGlobals(webkit);
	});
});

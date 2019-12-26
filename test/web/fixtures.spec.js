/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {strictEqual, deepStrictEqual} = require("assert");
const {copySync, removeSync} = require("fs-extra");
const express = require("express");
const puppeteer = require("puppeteer");
const {compileFixture} = require("../shared");
const script = require.resolve("@wildpeaks/snapshot-dom/lib/browser.js");

const port = 8888;
const localhost = `http://localhost:${port}/`;
const dist = join(__dirname, `../../tmp/dist`);
let app;
let server;

function sleep(duration) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}

before(function() {
	return new Promise(resolve => {
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

		app = express();
		app.use(express.static(dist));
		server = app.listen(port, () => {
			resolve();
		});
	});
});
after(function() {
	return new Promise(resolve => {
		server.close(() => {
			resolve();
		});
	});
});

async function testCompile({id, sources, compiled}) {
	const fixtureFolder = join(__dirname, id);
	const {filesBefore, errors, filesAfter} = await compileFixture(fixtureFolder);
	deepStrictEqual(filesBefore, sources.sort(), "Before Webpack");
	deepStrictEqual(errors, [], "No Webpack errors");
	deepStrictEqual(filesAfter, sources.concat(compiled).sort(), "After Webpack");
}

async function getSnapshot() {
	let tree;
	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(localhost, {waitUntil: "load"});
		await sleep(300);
		await page.addScriptTag({path: script});
		await sleep(300);
		tree = await page.evaluate(() => window.snapshotToJson(document.getElementById("mocha")));
	} finally {
		await browser.close();
	}
	if (tree === null || typeof tree !== "object") {
		throw new Error("Failed to snapshot #mocha element");
	}
	return tree.childNodes;
}

describe("Web: Core", function() {
	it("Basic", /* @this */ async function() {
		this.slow(15000);
		this.timeout(15000);
		await testCompile({
			id: "basic",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
			compiled: [
				"dist/index.html",
				"dist/app-basic.js"
			]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Basic"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});
});

describe("Web: Assets", function() {
	it("Images & JSON", /* @this */ async function() {
		this.slow(15000);
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

		const actual = await getSnapshot();
		strictEqual(actual.length, 9, "#mocha.childNodes.length");
		deepStrictEqual(actual[0], {nodeName: "#text", nodeValue: "Basic"});
		deepStrictEqual(actual[1].tagName, "img");
		deepStrictEqual(actual[3].tagName, "img");
		deepStrictEqual(actual[1].attributes.src.startsWith("data:image/jpeg;base64"), true);
		deepStrictEqual(actual[3].attributes.src.startsWith("data:image/png;base64"), true);
		deepStrictEqual(actual[2], {attributes: {src: "/myimages/large.jpg"}, tagName: "img"});
		deepStrictEqual(actual[4], {attributes: {src: "/myimages/large.png"}, tagName: "img"});
		deepStrictEqual(actual[5], {attributes: {src: "/myimages/small.gif"}, tagName: "img"});
		deepStrictEqual(actual[6], {attributes: {src: "/myimages/large.gif"}, tagName: "img"});
		deepStrictEqual(actual[7], {
			childNodes: [{nodeName: "#text", nodeValue: "/myimages/small.json"}],
			tagName: "div"
		});
		deepStrictEqual(actual[8], {
			childNodes: [{nodeName: "#text", nodeValue: "/myimages/large.json"}],
			tagName: "div"
		});
	});

	it("Copy Patterns", /* @this */ async function() {
		this.slow(10000);
		this.timeout(10000);
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

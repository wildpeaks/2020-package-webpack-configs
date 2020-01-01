/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {strictEqual, deepStrictEqual} = require("assert");
const {readFileSync} = require("fs");
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

async function getSnapshot(subpath = "") {
	let tree;
	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(localhost + subpath, {waitUntil: "load"});
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

async function getSnapshotColor() {
	let color;
	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(localhost, {waitUntil: "load"});
		await sleep(300);
		await page.addScriptTag({path: script});
		await sleep(300);
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

async function getSnapshotMultiple(subpath = "") {
	let tree1;
	let tree2;
	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(localhost + subpath, {waitUntil: "load"});
		await sleep(300);
		await page.addScriptTag({path: script});
		await sleep(300);
		tree1 = await page.evaluate(() => {
			const el1 = document.getElementById("mocha1");
			if (el1) {
				return window.snapshotToJson(el1).childNodes;
			}
			return "NOT FOUND";
		});
		tree2 = await page.evaluate(() => {
			const el2 = document.getElementById("mocha2");
			if (el2) {
				return window.snapshotToJson(el2).childNodes;
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

async function getSnapshotMultipleColor() {
	let color1;
	let color2;
	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(localhost, {waitUntil: "load"});
		await sleep(300);
		await page.addScriptTag({path: script});
		await sleep(300);
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

async function getSnapshotImage() {
	let color;
	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(localhost, {waitUntil: "load"});
		await sleep(300);
		await page.addScriptTag({path: script});
		await sleep(300);
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

describe("Core", function() {
	it("Basic", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "basic",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-basic.js"]
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

	it("Custom Filename", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "basic_filename",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/subfolder/custom.app-basic-filename.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Basic Filename"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
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
				"dist/app1.html",
				"dist/app2.html",
				"dist/app3.html",
				"dist/app-multiple-1.js",
				"dist/app-multiple-2.js",
				"dist/app-multiple-3.js"
			]
		});
		const actual1 = await getSnapshot("app1.html");
		const actual2 = await getSnapshot("app2.html");
		const actual3 = await getSnapshot("app3.html");
		const expected1 = [{nodeName: "#text", nodeValue: "Multiple 1"}];
		const expected2 = [{nodeName: "#text", nodeValue: "Multiple 2"}];
		const expected3 = [{nodeName: "#text", nodeValue: "Multiple 3"}];
		deepStrictEqual(actual1, expected1, "DOM structure");
		deepStrictEqual(actual2, expected2, "DOM structure");
		deepStrictEqual(actual3, expected3, "DOM structure");
	});

	it("Polyfills", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
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
	});

	it("Inject Patterns", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "inject",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-inject.js"]
		});

		let tags;
		const browser = await puppeteer.launch();
		try {
			const page = await browser.newPage();
			await page.goto(localhost, {waitUntil: "load"});
			await sleep(300);
			await page.addScriptTag({path: script});
			await sleep(300);
			tags = await page.evaluate(() => {
				const children = [...document.getElementsByTagName("link"), ...document.getElementsByTagName("script")];
				return children.map(window.snapshotToJson);
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
					type: "text/javascript",
					src: "http://example.com/script",
					hello: "example js"
				}
			},
			{
				tagName: "script",
				attributes: {
					type: "text/javascript",
					src: "/mypublic/thirdparty/three.min.js"
				}
			},
			{
				tagName: "script",
				attributes: {
					type: "text/javascript",
					src: "/mypublic/thirdparty/OrbitControls.js"
				}
			},
			{
				tagName: "script",
				attributes: {
					type: "text/javascript",
					src: "/mypublic/app-inject.js"
				}
			}
		]);
	});

	it("Multiple pages", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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

		const actual1 = await getSnapshotMultiple("page1.html");
		const expected1 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST One"}],
			mocha2: "NOT FOUND"
		};
		deepStrictEqual(actual1, expected1, "page1.html");

		const actual2 = await getSnapshotMultiple("page2.html");
		const expected2 = {
			mocha1: "NOT FOUND",
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Two"}]
		};
		deepStrictEqual(actual2, expected2, "page2.html");

		const actual3 = await getSnapshotMultiple("page3.html");
		const expected3 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST Three"}],
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Three"}]
		};
		deepStrictEqual(actual3, expected3, "page3.html");

		const actual4 = await getSnapshotMultiple("subfolder/page4.html");
		const expected4 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST Four"}],
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Four"}]
		};
		deepStrictEqual(actual4, expected4, "page4.html");

		let actual5;
		const browser5 = await puppeteer.launch();
		try {
			const page5 = await browser5.newPage();
			await page5.goto(localhost + "page5.html", {waitUntil: "load"});
			await sleep(300);
			await page5.addScriptTag({path: script});
			await sleep(300);
			actual5 = await page5.evaluate(() => {
				const children = [...document.getElementsByTagName("meta")];
				return children.map(window.snapshotToJson);
			});
		} finally {
			await browser5.close();
		}
		const expected5 = [
			{
				attributes: {
					charset: "UTF-8"
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
			}
		];
		deepStrictEqual(actual5, expected5, "page5.html");

		const actual6 = await getSnapshotMultiple("page6.html");
		const expected6 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST Six - Custom Option: AAAAA"}],
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Six - Custom Option: AAAAA"}]
		};
		deepStrictEqual(actual6, expected6, "page6.html");
	});
});

describe("Assets", function() {
	it("Images & JSON", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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

	it("Raw imports", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
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
	});
});

describe("Skip Reset", function() {
	it("False", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "skip_reset_false",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			extras: true,
			compiled: ["dist/index.html", "dist/app-skip-false.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Skip False"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});
	it("True", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Skip True"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});
});

describe("Stylesheets", function() {
	it("CSS Modules", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 128, 0)");
	});

	it("CSS Modules: Custom Filename", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 128, 0)");
	});

	it("CSS without CSS Modules", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 128, 0)");
	});

	it("CSS Reset", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "css_reset",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/reset.css"],
			compiled: ["dist/index.html", "dist/app-css-reset.js", "dist/app-css-reset.css"]
		});
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 128, 0)");
	});

	it("SCSS Reset", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "scss_reset",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/reset.scss"],
			compiled: ["dist/index.html", "dist/app-scss-reset.js", "dist/app-scss-reset.css"]
		});
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 128, 0)");
	});

	it("SCSS Global Import", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 128, 0)");
	});

	it("SCSS Global Define", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "scss_global_define",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts", "src/reset.scss"],
			compiled: ["dist/index.html", "dist/app-scss-global-define.js", "dist/app-scss-global-define.css"]
		});
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(128, 128, 0)");
	});

	it("SCSS Basic", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 128, 255)");
	});

	it("SCSS Import File", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 0, 255)");
	});

	it("SCSS Import Module", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 255, 0)");
	});

	it("CSS Chunks", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 0, 255)");
	});

	it("CSS Chunks Filename", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 0, 255)");
	});

	it("SCSS Chunks", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 0, 255)");
	});

	it("SCSS Chunks: Custom Filename", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 0, 255)");
	});

	it("SCSS Chunks & Variables", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color, "rgb(0, 0, 128)");
	});

	it("SCSS Data", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const color = await getSnapshotColor();
		strictEqual(color !== "rgb(0, 255, 0)", true, "Inline style");
	});

	it("SCSS Data & Import", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const colors = await getSnapshotMultipleColor();
		deepStrictEqual(colors, {body: "rgb(255, 0, 0)", mocha: "rgb(0, 0, 255)"});
	});

	it("SCSS Data Function", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const colors = await getSnapshotMultipleColor();
		deepStrictEqual(colors, {body: "rgb(255, 0, 0)", mocha: "rgb(0, 0, 255)"});
	});

	it("SCSS & Image", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshotImage();
		strictEqual(actual, 'url("http://localhost:8888/assets/large.jpg")');
	});

	it("CSS & Image", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshotImage();
		strictEqual(actual, 'url("http://localhost:8888/assets/large.jpg")');
	});
});

describe("Optimize", function() {
	it("Sourcemaps", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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

	it("Production mode", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);

		const sources = [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts",
			"src/application.css"
		];
		const compiled = ["dist/index.html", "dist/%%HASH%%.app-production.js", "dist/%%HASH%%.app-production.css"];
		const filesAfter = await testCompile({id: "production", sources});

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
			.map(filename => filename.replace("%%HASH%%", hash))
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

		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Production"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Production mode & Skip hashes", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);

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

		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Production"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Chunks", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "CHUNKS delayed 100123"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Chunks: Custom Filename", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "CHUNKS FILENAME delayed 100123"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Chunks: Polyfills", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshotMultiple();
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
	});

	it("Skip Postprocessing", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "skip_processing",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/app-skip-postprocessing.js"]
		});
	});
});

describe("Webworkers", function() {
	it("Basic", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "WORKER replies HELLO"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Custom filename", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "WORKER replies HELLO"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Polyfills", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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

		const actual = await getSnapshotMultiple();
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
	});

	it("No export {}", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
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
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "WORKER replies HELLO"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});
});

describe("Node features", function() {
	it("Fails: fs", /* @this */ async function() {
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

	it("Mocks: __dirname", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "node_dirname",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-dirname.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE DIRNAME /"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Mocks: process.cwd()", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "node_cwd",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-cwd.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE CWD /"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Accepts: url", /* @this */ async function() {
		// Note that package "native-url" would produce smaller bundles
		// than the polyfill Webpack uses.
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "node_url",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-url.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE URL https://example.com"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Accepts: path", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "node_path",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-path.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE PATH /hello/world.txt"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Accepts: assert", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "node_assert",
			sources: ["package.json", "tsconfig.json", "webpack.config.js", "src/application.ts"],
			compiled: ["dist/index.html", "dist/app-node-assert.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE ASSERT false true"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});
});

describe("Externals", function() {
	it("None", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_none",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/types.d.ts",
				"thirdparty/polyfills.js",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/index.html", "dist/app-externals-none.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "EXTERNALS NONE MODULE1 MODULE2"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it("Globals", /* @this */ async function() {
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_globals",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/types.d.ts",
				"thirdparty/polyfills.js",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/index.html", "dist/app-externals-globals.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "EXTERNALS GLOBALS GLOBAL1 GLOBAL2"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	});

	it(
		"Replace" /* async function() {
		// Disabled until https://github.com/webpack/webpack/issues/10201 is fixed
		this.slow(20000);
		this.timeout(20000);
		await testCompile({
			id: "externals_replace",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts",
				"src/types.d.ts",
				"thirdparty/polyfills.js",
				"node_modules/fake1/index.js",
				"node_modules/fake2/index.js"
			],
			compiled: ["dist/index.html", "dist/app-externals-replace.js"]
		});
		const actual = await getSnapshot();
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "EXTERNALS REPLACE DUMMY1 MODULE2"
			}
		];
		deepStrictEqual(actual, expected, "DOM structure");
	}*/
	);
});

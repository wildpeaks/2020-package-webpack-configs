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

async function testCompile({id, sources, compiled, extras}) {
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

	it("Custom Filename", /* @this */ async function() {
		this.slow(15000);
		this.timeout(15000);
		await testCompile({
			id: "basic_filename",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
			compiled: [
				"dist/index.html",
				"dist/subfolder/custom.app-basic-filename.js"
			]
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
		this.slow(15000);
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
		this.slow(15000);
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
		this.slow(15000);
		this.timeout(15000);
		await testCompile({
			id: "inject",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
			compiled: [
				"dist/index.html",
				"dist/app-inject.js"
			]
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
				const children = [
					...document.getElementsByTagName("link"),
					...document.getElementsByTagName("script")
				];
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
		this.slow(15000);
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

describe("Web: Skip Reset", function() {
	it("False", /* @this */ async function() {
		this.slow(15000);
		this.timeout(15000);
		await testCompile({
			id: "skip_false",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
			extras: true,
			compiled: [
				"dist/index.html",
				"dist/app-skip-false.js"
			]
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
		this.slow(15000);
		this.timeout(15000);
		await testCompile({
			id: "skip_true",
			sources: [
				"package.json",
				"tsconfig.json",
				"webpack.config.js",
				"src/application.ts"
			],
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

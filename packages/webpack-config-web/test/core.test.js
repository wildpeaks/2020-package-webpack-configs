/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-invalid-this */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const express = require("express");
const {readFileSync} = require("fs");
const {join} = require("path");
const {chromium} = require("playwright");
const {build, getFiles} = require("../../functions");
const {getSnapshot, getSnapshotLinkScriptTags, getSnapshotMetaTags, getSnapshotMultiple} = require("./functions");

it("Basic", async function () {
	const id = "basic";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-basic.js"]});

	const port = 3000;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Basic"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Custom Filename", async function () {
	const id = "basic_filename";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "subfolder/custom.app-basic-filename.js"]});

	const port = 3001;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Basic Filename"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Multiple entries", async function () {
	this.slow(15000);
	this.timeout(45000);

	const id = "multiple_entry";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: [
			"app1.html",
			"app2.html",
			"app3.html",
			"app-multiple-1.js",
			"app-multiple-2.js",
			"app-multiple-3.js"
		]
	});

	const port = 3002;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual1 = await getSnapshot(chromium, `http://localhost:${port}/app1.html`);
		const actual2 = await getSnapshot(chromium, `http://localhost:${port}/app2.html`);
		const actual3 = await getSnapshot(chromium, `http://localhost:${port}/app3.html`);
		const expected1 = [{nodeName: "#text", nodeValue: "Multiple 1"}];
		const expected2 = [{nodeName: "#text", nodeValue: "Multiple 2"}];
		const expected3 = [{nodeName: "#text", nodeValue: "Multiple 3"}];
		deepStrictEqual(actual1, expected1);
		deepStrictEqual(actual2, expected2);
		deepStrictEqual(actual3, expected3);
	} finally {
		server.close();
	}
});

it("Polyfills", async function () {
	const id = "polyfills";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-polyfills.js"]});

	const port = 3003;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
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
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Inject Patterns", async function () {
	const id = "inject";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-inject.js"]});

	const port = 3004;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotLinkScriptTags(chromium, `http://localhost:${port}/`);
		actual[4] = "REMOVED";
		const expected = [
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
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Multiple pages", async function () {
	this.slow(30000);
	this.timeout(60000);

	const id = "multiple_pages";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: [
			"app-pages-1.js",
			"app-pages-2.js",
			"page1.html",
			"page2.html",
			"page3.html",
			"subfolder/page4.html",
			"page5.html",
			"page6.html"
		]
	});

	const port = 3005;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual1 = await getSnapshotMultiple(chromium, `http://localhost:${port}/page1.html`);
		const expected1 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST One"}],
			mocha2: "NOT FOUND"
		};
		deepStrictEqual(actual1, expected1, "page1.html");

		const actual2 = await getSnapshotMultiple(chromium, `http://localhost:${port}/page2.html`);
		const expected2 = {
			mocha1: "NOT FOUND",
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Two"}]
		};
		deepStrictEqual(actual2, expected2, "page2.html");

		const actual3 = await getSnapshotMultiple(chromium, `http://localhost:${port}/page3.html`);
		const expected3 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST Three"}],
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Three"}]
		};
		deepStrictEqual(actual3, expected3, "page3.html");

		const actual4 = await getSnapshotMultiple(chromium, `http://localhost:${port}/subfolder/page4.html`);
		const expected4 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST Four"}],
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Four"}]
		};
		deepStrictEqual(actual4, expected4, "page4.html");

		const actual5 = await getSnapshotMetaTags(chromium, `http://localhost:${port}/page5.html`);
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

		const actual6 = await getSnapshotMultiple(chromium, `http://localhost:${port}/page6.html`);
		const expected6 = {
			mocha1: [{nodeName: "#text", nodeValue: "FIRST Six - Custom Option: AAAAA"}],
			mocha2: [{nodeName: "#text", nodeValue: "SECOND Six - Custom Option: AAAAA"}]
		};
		deepStrictEqual(actual6, expected6, "page6.html");
	} finally {
		server.close();
	}
});

it("Assets", async function () {
	const id = "assets";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: [
			"index.html",
			"app-assets.js",
			"myimages/large.jpg",
			"myimages/large.png",
			"myimages/small.gif",
			"myimages/large.gif",
			"myimages/small.json",
			"myimages/large.json"
		]
	});

	const port = 3006;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
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
	} finally {
		server.close();
	}
});

it("Copy Patterns", async function () {
	const id = "copy_patterns";
	await build({
		id,
		expectFiles: [
			"index.html",
			"app-copy-patterns.js",
			"copied-1/file1.example-1",
			"copied-1/file2.example-1",
			"copied-2/file1.example-1",
			"copied-2/file2.example-1",
			"copied-3/file1.example-1",
			"copied-3/file2.example-1",
			"copied-4/subfolder/file1.example-1",
			"copied-4/subfolder/file2.example-1",
			"copied-5/src/myfolder-2/hello/file3.example-1",
			"copied-5/src/myfolder-2/hello/file5.example-1",
			"copied-6/hello/file3.example-1",
			"copied-6/hello/file5.example-1",
			"copied-7/file7.example",
			"copied-7/file8.example",
			"copied-8/file9"
		]
	});
});

it("Raw imports", async function () {
	const id = "raw_imports";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-raw-imports.js"]});

	const port = 3007;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
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
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Skip Reset: False", async function () {
	const id = "skip_reset_false";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, extras: true, expectFiles: ["index.html", "app-skip-false.js"]});

	const port = 3008;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Skip False"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Skip Reset: True", async function () {
	const id = "skip_reset_true";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		extras: true,
		expectFiles: ["index.html", "app-skip-true.js", "extra-1.txt", "extra-2.js", "extra-3.ts"]
	});

	const port = 3009;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Skip True"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Sourcemaps", async function () {
	const id = "sourcemaps";
	await build({
		id,
		expectFiles: [
			"index.html",
			"app-sourcemaps.js",
			"app-sourcemaps.js.map",
			"app-sourcemaps.css",
			"app-sourcemaps.css.map"
		]
	});
});

it("Production Mode", async function () {
	const id = "production";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id});
	const actualFiles = await getFiles(dist);

	let hash = "";
	for (const actualFile of actualFiles) {
		const regex = /^([^.]+)\.app-production\.js$/;
		const matches = regex.exec(actualFile);
		if (matches) {
			hash = matches[1];
			break;
		}
	}
	if (hash === "") {
		throw new Error("No hash found");
	}

	const expectedFiles = ["index.html", `${hash}.app-production.css`, `${hash}.app-production.js`];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort(), "Generated files");

	const cssRaw = readFileSync(join(dist, `${hash}.app-production.css`), "utf8");
	if (/^.([^{}]+){color:green}/.exec(cssRaw) === null) {
		throw new Error("CSS is not minified");
	}

	const jsRaw = readFileSync(join(dist, `${hash}.app-production.js`), "utf8");
	if (!jsRaw.startsWith("!function(")) {
		throw new Error("JS is not minified");
	}

	const port = 3030;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Production"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Production mode & Skip hashes", async function () {
	const id = "production_skip_hashes";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id});
	const actualFiles = await getFiles(dist);

	let hash = "";
	for (const actualFile of actualFiles) {
		const regex = /^([^.]+)\.app-production\.js$/;
		const matches = regex.exec(actualFile);
		if (matches) {
			hash = matches[1];
			break;
		}
	}
	if (hash !== "") {
		throw new Error("Hashes were not skipped");
	}

	const expectedFiles = ["index.html", "app-production-skip-hashes.css", "app-production-skip-hashes.js"];
	deepStrictEqual(actualFiles.sort(), expectedFiles.sort(), "Generated files");

	const cssRaw = readFileSync(join(dist, "app-production-skip-hashes.css"), "utf8");
	if (/^.([^{}]+){color:green}/.exec(cssRaw) === null) {
		throw new Error("CSS is not minified");
	}

	const jsRaw = readFileSync(join(dist, "app-production-skip-hashes.js"), "utf8");
	if (!jsRaw.startsWith("!function(")) {
		throw new Error("JS is not minified");
	}

	const port = 3031;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "Production"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Chunks", async function () {
	const id = "chunks";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-chunks.js", "chunk.0.js"]});

	const port = 3032;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "CHUNKS delayed 100123"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Chunks: Custom Filename", async function () {
	const id = "chunks_filename";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-chunks-filename.js", "subfolder/custom.chunk.0.js"]});

	const port = 3033;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "CHUNKS FILENAME delayed 100123"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Chunks: Polyfills", async function () {
	const id = "chunks_polyfills";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-chunks-polyfills.js", "chunk.0.js"]});

	const port = 3034;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotMultiple(chromium, `http://localhost:${port}/`);
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
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Skip Postprocessing", async function () {
	const id = "skip_processing";
	await build({id, expectFiles: ["app-skip-postprocessing.js"]});
});

it("Fails: fs", async function () {
	const id = "node_fs";
	await build({id, expectError: true});
});

it("Mocks: __dirname", async function () {
	const id = "node_dirname";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-node-dirname.js"]});

	const port = 3039;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE DIRNAME /"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Mocks: process.cwd()", async function () {
	const id = "node_cwd";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-node-cwd.js"]});

	const port = 3040;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE CWD /"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Accepts: url", async function () {
	const id = "node_url";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-node-url.js"]});

	const port = 3041;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE URL https://example.com"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Accepts: path", async function () {
	const id = "node_path";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-node-path.js"]});

	const port = 3042;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE PATH /hello/world.txt"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Accepts: assert", async function () {
	const id = "node_assert";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-node-assert.js"]});

	const port = 3043;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "NODE ASSERT false true"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Externals: undefined", async function () {
	const id = "externals_undefined";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-externals-undefined.js"]});

	const port = 3044;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "EXTERNALS UNDEFINED MODULE1 MODULE2"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Externals: Globals", async function () {
	const id = "externals_globals";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-externals-globals.js"]});

	const port = 3045;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "EXTERNALS GLOBALS GLOBAL1 GLOBAL2"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

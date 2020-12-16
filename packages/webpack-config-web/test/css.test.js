/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual, deepStrictEqual} = require("assert");
const express = require("express");
const {join} = require("path");
const {chromium} = require("playwright");
const {build} = require("../../functions");
const {getSnapshotColor, getSnapshotMultipleColor, getSnapshotImage} = require("./functions");

it("CSS Modules", async function () {
	const id = "css_modules";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-css-modules.js", "app-css-modules.css"]});

	const port = 3010;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 128, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("CSS Modules: Custom Filename", async function () {
	const id = "css_modules_filename";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: ["index.html", "app-css-modules-filename.js", "subfolder/custom.app-css-modules-filename.css"]
	});

	const port = 3011;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 128, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("CSS without CSS Modules", async function () {
	const id = "css_no_modules";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-css-no-modules.js", "app-css-no-modules.css"]});

	const port = 3012;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 128, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("CSS Reset", async function () {
	const id = "css_reset";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-css-reset.js", "app-css-reset.css"]});

	const port = 3013;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 128, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Reset", async function () {
	const id = "scss_reset";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-reset.js", "app-scss-reset.css"]});

	const port = 3014;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 128, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Global Import", async function () {
	const id = "scss_global_import";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-global-import.js", "app-scss-global-import.css"]});

	const port = 3015;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 128, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Global Define", async function () {
	const id = "scss_global_define";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-global-define.js", "app-scss-global-define.css"]});

	const port = 3016;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(128, 128, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Basic", async function () {
	const id = "scss_basic";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-basic.js", "app-scss-basic.css"]});

	const port = 3017;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 128, 255)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Import File", async function () {
	const id = "scss_import_file";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-import-file.js", "app-scss-import-file.css"]});

	const port = 3018;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 0, 255)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Import Module", async function () {
	const id = "scss_import_module";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-import-module.js", "app-scss-import-module.css"]});

	const port = 3019;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 255, 0)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("CSS Chunks", async function () {
	const id = "css_chunks";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: ["index.html", "app-css-chunks.js", "app-css-chunks.css", "chunk.0.js", "chunk.0.css"]
	});

	const port = 3020;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 0, 255)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("CSS Chunks Filename", async function () {
	const id = "css_chunks_filename";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: [
			"index.html",
			"app-css-chunks-filename.js",
			"app-css-chunks-filename.css",
			"chunk.0.js",
			"subfolder/custom.chunk.0.css"
		]
	});

	const port = 3021;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 0, 255)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Chunks", async function () {
	const id = "scss_chunks";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: ["index.html", "app-scss-chunks.js", "app-scss-chunks.css", "chunk.0.js", "chunk.0.css"]
	});

	const port = 3022;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 0, 255)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Chunks: Custom Filename", async function () {
	const id = "scss_chunks_filename";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: [
			"index.html",
			"app-scss-chunks-filename.js",
			"app-scss-chunks-filename.css",
			"chunk.0.js",
			"subfolder/custom.chunk.0.css"
		]
	});

	const port = 3023;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		strictEqual(actual, "rgb(0, 0, 255)");
	} finally {
		server.close();
	}
});

it("SCSS Chunks & Variables", async function () {
	const id = "scss_chunks_variables";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: [
			"index.html",
			"app-scss-chunks-variables.js",
			"app-scss-chunks-variables.css",
			"chunk.0.js",
			"chunk.0.css"
		]
	});

	const port = 3024;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		const expected = "rgb(0, 0, 128)";
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Data", async function () {
	const id = "scss_data";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: [
			"index.html",
			"app-scss-data.js"

			// Data alone isn't enough to produce a .css: at least one entry must contain
			// an import or polyfill to a stylesheet, otherwise the loader skips
			// extracting styles, unfortunately.
			// "app-scss-data.css"
		]
	});

	const port = 3025;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotColor(chromium, `http://localhost:${port}/`);
		strictEqual(actual !== "rgb(0, 255, 0)", true, "Inline style");
	} finally {
		server.close();
	}
});

it("SCSS Data & Import", async function () {
	const id = "scss_data_import";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-data-import.js", "app-scss-data-import.css"]});

	const port = 3026;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotMultipleColor(chromium, `http://localhost:${port}/`);
		const expected = {
			body: "rgb(255, 0, 0)",
			mocha: "rgb(0, 0, 255)"
		};
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS Data Function", async function () {
	const id = "scss_data_function";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-data-function.js", "app-scss-data-function.css"]});

	const port = 3027;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotMultipleColor(chromium, `http://localhost:${port}/`);
		const expected = {
			body: "rgb(255, 0, 0)",
			mocha: "rgb(0, 0, 255)"
		};
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("SCSS & Image", async function () {
	const id = "scss_image";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-scss-image.js", "app-scss-image.css", "assets/large.jpg"]});

	const port = 3028;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotImage(chromium, `http://localhost:${port}/`);
		const expected = `url("http://localhost:${port}/assets/large.jpg")`;
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("CSS & Image", async function () {
	const id = "css_image";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-css-image.js", "app-css-image.css", "assets/large.jpg"]});

	const port = 3029;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotImage(chromium, `http://localhost:${port}/`);
		const expected = `url("http://localhost:${port}/assets/large.jpg")`;
		strictEqual(actual, expected);
	} finally {
		server.close();
	}
});

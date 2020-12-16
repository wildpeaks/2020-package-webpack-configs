/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-invalid-this */
"use strict";
const {deepStrictEqual} = require("assert");
const express = require("express");
const {join} = require("path");
const {chromium} = require("playwright");
const {build} = require("../../functions");
const {getSnapshot, getSnapshotMultiple} = require("./functions");

it("Webworkers: Basic", async function () {
	const id = "webworker";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-webworker.js", "myworker.webworker.js"]});

	const port = 3035;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "WORKER replies HELLO"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Webworkers: Custom filename", async function () {
	const id = "webworker_filename";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({
		id,
		expectFiles: ["index.html", "app-webworker-filename.js", "subfolder/custom.myworker.webworker.js"]
	});

	const port = 3036;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "WORKER replies HELLO"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Webworkers: Polyfills", async function () {
	const id = "webworker_polyfills";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-webworker-polyfills.js", "application.webworker.js"]});

	const port = 3037;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshotMultiple(chromium, `http://localhost:${port}/`);
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
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

it("Webworkers: No export {}", async function () {
	const id = "webworker";
	const dist = join(process.cwd(), `test/${id}/dist`);
	await build({id, expectFiles: ["index.html", "app-webworker.js", "myworker.webworker.js"]});

	const port = 3038;
	const app = express();
	app.use(express.static(dist));
	const server = app.listen(port);
	try {
		const actual = await getSnapshot(chromium, `http://localhost:${port}/`);
		const expected = [
			{
				nodeName: "#text",
				nodeValue: "WORKER replies HELLO"
			}
		];
		deepStrictEqual(actual, expected);
	} finally {
		server.close();
	}
});

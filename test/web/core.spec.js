/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {deepStrictEqual} = require("assert");
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

function testFixture({id, title, sources, compiled, nodes}) {
	it(title, /* @this */ async function() {
		this.slow(15000);
		this.timeout(15000);

		const fixtureFolder = join(__dirname, id);
		const {filesBefore, errors, filesAfter} = await compileFixture(fixtureFolder);
		deepStrictEqual(filesBefore, sources.sort(), "Before Webpack");
		deepStrictEqual(errors, [], "No Webpack errors");
		deepStrictEqual(filesAfter, sources.concat(compiled).sort(), "After Webpack");

		let actualNodes;
		const browser = await puppeteer.launch();
		try {
			const page = await browser.newPage();
			await page.goto(localhost, {waitUntil: "load"});
			await sleep(300);
			await page.addScriptTag({path: script});
			await sleep(300);
			actualNodes = await page.evaluate(() => window.snapshotToJson(document.getElementById("mocha")));
		} finally {
			await browser.close();
		}
		if ((actualNodes === null) || (typeof actualNodes !== "object")) {
			throw new Error("Failed to snapshot #mocha element");
		}
		deepStrictEqual(actualNodes.childNodes, nodes, "Puppeteer");
	});
}

describe("Core", function() {
	testFixture({
		id: "basic",
		title: "Accepts: Basic",
		sources: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		],
		compiled: [
			"dist/index.html",
			"dist/app-basic.js"
		],
		nodes: [
			{
				nodeName: "#text",
				nodeValue: "Basic"
			}
		]
	});
});

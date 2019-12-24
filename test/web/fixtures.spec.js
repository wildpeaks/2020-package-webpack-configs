/* eslint-env node, mocha, browser */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {join} = require("path");
const {strictEqual, deepStrictEqual} = require("assert");
const {copySync, removeSync} = require("fs-extra");
const express = require("express");
const puppeteer = require("puppeteer");
const {compileFixture} = require("../shared");

const dist = join(__dirname, `../../tmp/dist`);
const port = 8888;
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

function testFixture({id, title, sourceFiles, webpackFiles, html}) {
	it(title, /* @this */ async function() {
		this.slow(30000);
		this.timeout(30000);

		const fixtureFolder = join(__dirname, id);
		const compiled = await compileFixture(fixtureFolder);
		deepStrictEqual(compiled.filesBefore, sourceFiles.sort(), "Before Webpack");
		deepStrictEqual(compiled.errors, [], "No Webpack errors");
		deepStrictEqual(compiled.filesAfter, sourceFiles.concat(webpackFiles).sort(), "After Webpack");
		// console.log(compiled.output);

		let actualHTML = "";
		const browser = await puppeteer.launch();
		try {
			const page = await browser.newPage();
			await page.goto(`http://localhost:${port}/`);
			await sleep(300);
			actualHTML = await page.evaluate(() => {
				const el = document.getElementById("hello");
				if (el === null) {
					return "Error: #hello not found";
				}
				return el.innerHTML;
			});
		} finally {
			await browser.close();
		}
		strictEqual(actualHTML, html);
	});
}


describe("Web Fixtures", function() {
	testFixture({
		id: "basic",
		title: "Accepts: Basic",
		sourceFiles: [
			"package.json",
			"tsconfig.json",
			"webpack.config.js",
			"src/application.ts"
		],
		webpackFiles: [
			"dist/index.html",
			"dist/app-basic.js"
		],
		html: "[BASIC] Hello World"
	});
});

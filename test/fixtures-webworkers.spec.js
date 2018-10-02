/* eslint-env node, jasmine */
'use strict';
const {join, relative} = require('path');
const {mkdirSync} = require('fs');
const express = require('express');
const rimraf = require('rimraf');
const rreaddir = require('recursive-readdir');
const webpack = require('webpack');
const puppeteer = require('puppeteer');
const getConfig = require('..');
const rootFolder = join(__dirname, 'fixtures');
const outputFolder = join(__dirname, '../out-webworkers');
let app;
let server;


/**
 * @param {Number} duration
 */
function sleep(duration){
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
}


/**
 * @param {webpack.Configuration} config
 */
function compile(config){
	return new Promise((resolve, reject) => {
		webpack(config, (err, stats) => {
			if (err){
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
async function testFixture(options){
	const config = getConfig(options);
	expect(typeof options).toBe('object');

	const stats = await compile(config);
	expect(stats.compilation.errors).toEqual([]);

	let actualFiles = await rreaddir(outputFolder);
	actualFiles = actualFiles.map(filepath => relative(outputFolder, filepath).replace(/\\/g, '/'));
	return actualFiles;
}


beforeAll(() => {
	app = express();
	app.use(express.static(outputFolder));
	server = app.listen(8883);
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
});

afterAll(done => {
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


it('Webworkers', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './webworkers/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'relative.webworker.js',
		'relative.webworker.js.map',
		'my-worker-module.webworker.js',
		'my-worker-module.webworker.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			const el1 = document.getElementById('hello1');
			if (el1 === null){
				return '#hello1 not found';
			}
			if (el1.innerText !== 'RELATIVE WORKER replies HELLO 1'){
				return `Bad #hello1.innerText: ${el1.innerText}`;
			}
			const el2 = document.getElementById('hello2');
			if (el2 === null){
				return '#hello2 not found';
			}
			if (el2.innerText !== 'MODULE WORKER replies HELLO 2'){
				return `Bad #hello2.innerText: ${el2.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Webworkers + Polyfills', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './webworkers-polyfills/myapp.ts'
		},
		polyfills: [
			'./webworkers-polyfills/both.polyfill.ts',
			'./webworkers-polyfills/only-main.polyfill.ts'
		],
		webworkerPolyfills: [
			'./both.polyfill',
			'./only-worker.polyfill',
			'module-self-polyfill'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'myapp.webworker.js',
		'myapp.webworker.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			const el1 = document.getElementById('hello1');
			if (el1 === null){
				return '#hello1 not found';
			}
			if (el1.innerText !== 'BOTH once undefined MAIN once undefined'){
				return `Bad #hello1.innerText: ${el1.innerText}`;
			}

			const el2 = document.getElementById('hello2');
			if (el2 === null){
				return '#hello2 not found';
			}
			if (el2.innerText !== 'BOTH once WORKER once undefined MODULE once'){
				return `Bad #hello2.innerText: ${el2.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});

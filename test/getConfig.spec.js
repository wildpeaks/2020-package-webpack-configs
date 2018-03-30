/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const {mkdirSync, readdirSync} = require('fs');
const express = require('express');
const rimraf = require('rimraf');
const webpack = require('webpack');
const puppeteer = require('puppeteer');
const getConfig = require('..');

const rootFolder = join(__dirname, 'fixtures');
const outputFolder = join(__dirname, '../out');

let app;
let server;


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
 * @param {String} fixtureFilename
 */
async function testFixture(options, expectedFiles){
	const config = getConfig(options);
	expect(typeof options).toBe('object');

	const stats = await compile(config);
	expect(stats.compilation.errors).toEqual([]);

	const actualFiles = readdirSync(outputFolder, 'utf8');
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());
}


beforeAll(() => {
	app = express();
	app.use(express.static(outputFolder));
	server = app.listen(8888);
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


it('Basic', async() => {
	await testFixture(
		{
			rootFolder,
			outputFolder,
			entry: {
				myapp: './basic/myapp.ts'
			},
			minify: false
		},
		[
			'index.html',
			'myapp.js',
			'myapp.js.map'
		]
	);
	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* eslint-disable */
			var el = document.getElementById('hello');
			if (typeof el === 'undefined'){
				return '#hello not found';
			}
			if (el.innerText !== 'Hello World'){
				return 'Bad #hello.innerText';
			}
			return 'ok';
			/* eslint-enable */
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Local Modules', async() => {
	await testFixture(
		{
			rootFolder,
			outputFolder,
			entry: {
				myapp: './local-modules/myapp.ts'
			},
			minify: false
		},
		[
			'index.html',
			'myapp.js',
			'myapp.js.map'
		]
	);
	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* eslint-disable */
			var el = document.getElementById('hello');
			if (typeof el === 'undefined'){
				return '#hello not found';
			}
			if (el.innerText !== 'Hello 100123'){
				return 'Bad #hello.innerText';
			}
			return 'ok';
			/* eslint-enable */
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});

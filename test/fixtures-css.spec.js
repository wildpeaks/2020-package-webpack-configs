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
const outputFolder = join(__dirname, '../out-assets');
let app;
let server;
const port = 8884;


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
	server = app.listen(port);
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


it('CSS Modules', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-modules/myapp.ts'
		},
		cssModules: true
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 128, 0)'){
				return 'Bad color: ' + computed.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('CSS without CSS Modules', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-no-modules/myapp.ts'
		},
		cssModules: false
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 128, 0)'){
				return 'Bad color: ' + computed.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('CSS Reset', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-reset/myapp.ts'
		},
		polyfills: [
			'./css-reset/reset.css'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.createElement('div');
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue('color') === 'rgb(0, 0, 128)'){
				return 'Unexpected color before appending';
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue('color') !== 'rgb(0, 0, 128)'){
				return 'Bad color: ' + computed2.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('SCSS: Reset', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './scss-reset/myapp.ts'
		},
		polyfills: [
			'./scss-reset/reset.scss'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.createElement('div');
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue('color') === 'rgb(0, 128, 0)'){
				return 'Unexpected color before appending';
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue('color') !== 'rgb(0, 128, 0)'){
				return 'Bad color: ' + computed2.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('SCSS Global Import', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './scss-globals-import/myapp.ts'
		},
		scss: '@import "variables.scss";',
		polyfills: [
			'./scss-globals-import/reset.scss'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.createElement('div');
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue('color') === 'rgb(128, 0, 0)'){
				return 'Unexpected color before appending';
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue('color') !== 'rgb(128, 0, 0)'){
				return 'Bad color: ' + computed2.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('SCSS Global Variables', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './scss-globals-define/myapp.ts'
		},
		scss: '$mycolor: rgb(128, 128, 0);',
		polyfills: [
			'./scss-globals-define/reset.scss'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.createElement('div');
			const computed1 = window.getComputedStyle(el);
			if (computed1.getPropertyValue('color') === 'rgb(128, 128, 0)'){
				return 'Unexpected color before appending';
			}
			document.body.appendChild(el);
			const computed2 = window.getComputedStyle(el);
			if (computed2.getPropertyValue('color') !== 'rgb(128, 128, 0)'){
				return 'Bad color: ' + computed2.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('SCSS Basic', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './scss-basic/myapp.ts'
		},
		cssModules: true
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 128, 255)'){
				return 'Bad color: ' + computed.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('SCSS Import File', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './scss-import-file/myapp.ts'
		},
		cssModules: true
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 0, 255)'){
				return 'Bad color: ' + computed.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('SCSS Import Module', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './scss-import-module/myapp.ts'
		},
		cssModules: true
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${port}/`);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 255, 0)'){
				return 'Bad color: ' + computed.getPropertyValue('color');
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});

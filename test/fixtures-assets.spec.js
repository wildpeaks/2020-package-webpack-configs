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
	server = app.listen(8880);
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
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 128, 0)'){
				return 'Bad color';
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
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			const computed = window.getComputedStyle(el);
			if (computed.getPropertyValue('color') !== 'rgb(0, 128, 0)'){
				return 'Bad color';
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Assets', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './assets/myapp.ts'
		},
		embedLimit: 5000,
		embedExtensions: ['jpg', 'png'],
		copyExtensions: ['gif', 'json'],
		assetsRelativePath: 'myimages/'
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'myimages/large.jpg',
		'myimages/large.png',
		'myimages/small.gif',
		'myimages/large.gif',
		'myimages/small.json',
		'myimages/large.json'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const container = document.getElementById('assets');
			if (container === null){
				return '#assets not found';
			}
			if (container.childNodes.length !== 8){
				return `Wrong #assets.childNodes.length: ${container.childNodes.length}`;
			}
			for (let i = 0; i < 6; i++){
				const img = container.childNodes[i];
				if (img.nodeName !== 'IMG'){
					return `#assets.childNodes[${i}] isn't an IMG: ${img.nodeName}`;
				}
			}
			for (let i = 6; i < 8; i++){
				const div = container.childNodes[i];
				if (div.nodeName !== 'DIV'){
					return `#assets.childNodes[${i}] isn't a DIV: ${div.nodeName}`;
				}
			}

			const img0 = container.childNodes[0].getAttribute('src');
			const img1 = container.childNodes[1].getAttribute('src');
			const img2 = container.childNodes[2].getAttribute('src');
			const img3 = container.childNodes[3].getAttribute('src');
			const img4 = container.childNodes[4].getAttribute('src');
			const img5 = container.childNodes[5].getAttribute('src');
			const div0 = container.childNodes[6];
			const div1 = container.childNodes[7];

			if (!img0.startsWith('data:image/jpeg;base64')){
				return `#assets.childNodes[0] is not a base64 embed: ${img0}`;
			}
			if (!img2.startsWith('data:image/png;base64')){
				return `#assets.childNodes[2] is not a base64 embed: ${img2}`;
			}
			if (img1 !== '/myimages/large.jpg'){
				return `Wrong url for #assets.childNodes[1]: ${img1}`;
			}
			if (img3 !== '/myimages/large.png'){
				return `Wrong url for #assets.childNodes[3]: ${img3}`;
			}
			if (img4 !== '/myimages/small.gif'){
				return `Wrong url for #assets.childNodes[4]: ${img4}`;
			}
			if (img5 !== '/myimages/large.gif'){
				return `Wrong url for #assets.childNodes[5]: ${img5}`;
			}
			if (div0.innerText !== '/myimages/small.json'){
				return `Wrong url for #assets.childNodes[6].innerText: ${div0.innerText}`;
			}
			if (div1.innerText !== '/myimages/large.json'){
				return `Wrong url for #assets.childNodes[7].innerText: ${div1.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Copy Patterns', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './copy-patterns/myapp.ts'
		},
		copyPatterns: [
			// Without "**", "from" is the context:
			{from: 'copy-patterns/myfolder-1', to: 'copied-1'},
			{from: 'copy-patterns/myfolder-1', to: 'copied-2/'},
			{from: 'copy-patterns/myfolder-1', to: 'copied-3', toType: 'dir'},
			{from: 'copy-patterns/myfolder-1', to: 'copied-4/subfolder'},

			// With "**", it copies using the whole path (hence creates a "copy-patterns/myfolder-2" folder in output).
			// Use "context" to make it use only the end of the path.
			{from: 'copy-patterns/myfolder-2/**/*.example-1', to: 'copied-5'},
			{from: '**/*.example-1', to: 'copied-6', context: 'copy-patterns/myfolder-2'},

			// File-looking folder name
			{from: 'copy-patterns/myfolder-3.ext', to: 'copied-7'},

			// Folder-looking filename
			{from: 'copy-patterns/file9', to: 'copied-8'}
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',

		'copied-1/file1.example-1',
		'copied-1/file2.example-1',
		'copied-2/file1.example-1',
		'copied-2/file2.example-1',
		'copied-3/file1.example-1',
		'copied-3/file2.example-1',
		'copied-4/subfolder/file1.example-1',
		'copied-4/subfolder/file2.example-1',

		'copied-5/copy-patterns/myfolder-2/hello/file3.example-1',
		'copied-5/copy-patterns/myfolder-2/hello/file5.example-1',
		'copied-6/hello/file3.example-1',
		'copied-6/hello/file5.example-1',

		'copied-7/file7.example',
		'copied-7/file8.example',

		'copied-8/file9'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());
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
		await page.goto('http://localhost:8888/');
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
				return 'Bad color';
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


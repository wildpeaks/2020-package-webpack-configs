/* eslint-env node, jasmine */
'use strict';
const {join, relative} = require('path');
const {readFileSync, mkdirSync} = require('fs');
const express = require('express');
const rimraf = require('rimraf');
const rreaddir = require('recursive-readdir');
const webpack = require('webpack');
const puppeteer = require('puppeteer');
const getConfig = require('..');
const rootFolder = join(__dirname, 'fixtures');
const outputFolder = join(__dirname, '../out');
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
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: './basic/myapp.ts'
		},
		minify: false
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (typeof el === 'undefined'){
				return '#hello not found';
			}
			if (el.innerText !== 'Hello World'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Local Modules', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: './local-modules/myapp.ts'
		},
		minify: false
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (typeof el === 'undefined'){
				return '#hello not found';
			}
			if (el.innerText !== 'Hello 100123'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('CSS', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: './css/myapp.ts'
		},
		minify: false
	});
	const expectedFiles = [
		'index.html',
		'myapp.css',
		'myapp.css.map',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			const el = document.getElementById('hello');
			if (typeof el === 'undefined'){
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
		entry: {
			myapp: './assets/myapp.ts'
		},
		minify: false,
		embedLimit: 5000,
		embedExtensions: ['jpg', 'png'],
		copyExtensions: ['gif'],
		assetsRelativePath: 'myimages/'
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'myimages/large.jpg',
		'myimages/large.png',
		'myimages/small.gif',
		'myimages/large.gif'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const container = document.getElementById('images');
			if (typeof container === 'undefined'){
				return '#images not found';
			}
			if (container.childNodes.length !== 6){
				return `Wrong #images.childNodes.length: ${container.childNodes.length}`;
			}
			for (let i = 0; i < 6; i++){
				const img = container.childNodes[i];
				if (img.nodeName !== 'IMG'){
					return `#images.childNodes[${i}] isn't an image: ${img.nodeName}`;
				}
			}

			const img0 = container.childNodes[0].getAttribute('src');
			const img1 = container.childNodes[1].getAttribute('src');
			const img2 = container.childNodes[2].getAttribute('src');
			const img3 = container.childNodes[3].getAttribute('src');
			const img4 = container.childNodes[4].getAttribute('src');
			const img5 = container.childNodes[5].getAttribute('src');

			if (!img0.startsWith('data:image/jpeg;base64')){
				return `#images.childNodes[0] is not a base64 embed: ${img0}`;
			}
			if (!img2.startsWith('data:image/png;base64')){
				return `#images.childNodes[2] is not a base64 embed: ${img2}`;
			}
			if (img1 !== '/myimages/large.jpg'){
				return `Wrong url for #images.childNodes[1]: ${img1}`;
			}
			if (img3 !== '/myimages/large.png'){
				return `Wrong url for #images.childNodes[3]: ${img3}`;
			}
			if (img4 !== '/myimages/small.gif'){
				return `Wrong url for #images.childNodes[4]: ${img4}`;
			}
			if (img5 !== '/myimages/large.gif'){
				return `Wrong url for #images.childNodes[5]: ${img5}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Chunks', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: './chunks/myapp.ts'
		},
		minify: false
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'chunk.0.js',
		'chunk.0.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(50);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (typeof el === 'undefined'){
				return '#hello not found';
			}
			if (el.innerText !== 'Delayed 100123'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Minify', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: './css/myapp.ts'
		},
		minify: true
	});
	const expectedFiles = [
		'index.html',
		'6ac083f8f7ac3d5a7c95.myapp.css',
		'6ac083f8f7ac3d5a7c95.myapp.css.map',
		'6ac083f8f7ac3d5a7c95.myapp.js',
		'6ac083f8f7ac3d5a7c95.myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, `6ac083f8f7ac3d5a7c95.myapp.css`), 'utf8');
	expect(cssRaw.startsWith('._11R8tFIZnfk4aMR46TKsu_{color:green}'), true, 'CSS not minified');

	const jsRaw = readFileSync(join(outputFolder, `6ac083f8f7ac3d5a7c95.myapp.js`), 'utf8');
	expect(jsRaw.startsWith('!function(e){'), true, 'JS not minified');

	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el0 = document.getElementById('hello');
			if (typeof el0 === 'undefined'){
				return '#hello not found';
			}
			if (el0.innerText !== 'Hello World'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.querySelector('script');
			if (el1 === null){
				return 'No script';
			}
			const jsSrc = el1.getAttribute('src');
			const jsCrossorigin = el1.getAttribute('crossorigin');
			const jsIntegrity = el1.getAttribute('integrity');
			if (jsSrc !== '/6ac083f8f7ac3d5a7c95.myapp.js'){
				return `Bad script.src: ${jsSrc}`;
			}
			if (jsCrossorigin !== 'anonymous'){
				return `Bad script.crossorigin: ${jsCrossorigin}`;
			}
			if (!jsIntegrity.includes('sha256-') && !jsIntegrity.includes('sha384-')){
				return `Bad script.integrity: ${jsIntegrity}`;
			}

			const el2 = document.querySelector('link[rel="stylesheet"]');
			if (el2 === null){
				return 'No stylesheet';
			}
			const cssHref = el2.getAttribute('href');
			const cssCrossorigin = el2.getAttribute('crossorigin');
			const cssIntegrity = el2.getAttribute('integrity');
			if (cssHref !== '/6ac083f8f7ac3d5a7c95.myapp.css'){
				return `Bad link.href: ${cssHref}`;
			}
			if (cssCrossorigin !== 'anonymous'){
				return `Bad link.crossorigin: ${cssCrossorigin}`;
			}
			if (!cssIntegrity.includes('sha256-') && !cssIntegrity.includes('sha384-')){
				return `Bad link.integrity: ${cssIntegrity}`;
			}

			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});

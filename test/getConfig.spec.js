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

	// const actualFiles = readdirSync(outputFolder, 'utf8');
	// const actualFiles = await rreaddir(outputFolder);
	let actualFiles = await rreaddir(outputFolder);
	actualFiles = actualFiles.map(filepath => relative(outputFolder, filepath).replace(/\\/g, '/'));

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


// it('Basic', async() => {
// 	await testFixture(
// 		{
// 			rootFolder,
// 			outputFolder,
// 			entry: {
// 				myapp: './basic/myapp.ts'
// 			},
// 			minify: false
// 		},
// 		[
// 			'index.html',
// 			'myapp.js',
// 			'myapp.js.map'
// 		]
// 	);
// 	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
// 	try {
// 		const page = await browser.newPage();
// 		await page.goto('http://localhost:8888/');
// 		const found = await page.evaluate(() => {
// 			/* eslint-disable */
// 			var el = document.getElementById('hello');
// 			if (typeof el === 'undefined'){
// 				return '#hello not found';
// 			}
// 			if (el.innerText !== 'Hello World'){
// 				return 'Bad #hello.innerText';
// 			}
// 			return 'ok';
// 			/* eslint-enable */
// 		});
// 		expect(found).toBe('ok', 'DOM tests');
// 	} finally {
// 		await browser.close();
// 	}
// });


// it('Local Modules', async() => {
// 	await testFixture(
// 		{
// 			rootFolder,
// 			outputFolder,
// 			entry: {
// 				myapp: './local-modules/myapp.ts'
// 			},
// 			minify: false
// 		},
// 		[
// 			'index.html',
// 			'myapp.js',
// 			'myapp.js.map'
// 		]
// 	);
// 	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
// 	try {
// 		const page = await browser.newPage();
// 		await page.goto('http://localhost:8888/');
// 		const found = await page.evaluate(() => {
// 			/* eslint-disable */
// 			var el = document.getElementById('hello');
// 			if (typeof el === 'undefined'){
// 				return '#hello not found';
// 			}
// 			if (el.innerText !== 'Hello 100123'){
// 				return 'Bad #hello.innerText';
// 			}
// 			return 'ok';
// 			/* eslint-enable */
// 		});
// 		expect(found).toBe('ok', 'DOM tests');
// 	} finally {
// 		await browser.close();
// 	}
// });


// it('CSS', async() => {
// 	await testFixture(
// 		{
// 			rootFolder,
// 			outputFolder,
// 			entry: {
// 				myapp: './css/myapp.ts'
// 			},
// 			minify: false
// 		},
// 		[
// 			'index.html',
// 			'myapp.css',
// 			'myapp.css.map',
// 			'myapp.js',
// 			'myapp.js.map'
// 		]
// 	);
// 	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
// 	try {
// 		const page = await browser.newPage();
// 		await page.goto('http://localhost:8888/');
// 		const found = await page.evaluate(() => {
// 			/* eslint-disable */
// 			var el = document.getElementById('hello');
// 			if (typeof el === 'undefined'){
// 				return '#hello not found';
// 			}
// 			var computed = getComputedStyle(el);
// 			if (computed.getPropertyValue('color') !== 'rgb(0, 128, 0)'){
// 				return 'Bad color';
// 			}
// 			return 'ok';
// 			/* eslint-enable */
// 		});
// 		expect(found).toBe('ok', 'DOM tests');
// 	} finally {
// 		await browser.close();
// 	}
// });


it('Assets', async() => {
	await testFixture(
		{
			rootFolder,
			outputFolder,
			entry: {
				myapp: './assets/myapp.ts'
			},
			minify: false,
			embedLimit: 5000,
			embedExtensions: ['jpg', 'png'],
			copyExtensions: ['gif'], // no files copied ???
			assetsRelativePath: 'myimages/'
		},
		[
			'index.html',
			'myapp.js',
			'myapp.js.map',
			'myimages/large.jpg',
			'myimages/large.png',
			'myimages/small.gif',
			'myimages/large.gif'
		]
	);
	const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* eslint-disable */
			var container = document.getElementById('images');
			if (typeof container === 'undefined'){
				return '#images not found';
			}
			if (container.childNodes.length !== 6){
				return 'Wrong #images.childNodes.length: ' + container.childNodes.length;
			}
			for (var i = 0; i < 6; i++){
				var img = container.childNodes[i];
				if (img.nodeName !== 'IMG'){
					return '#images.childNodes[' + i + '] isn\'t an image: ' + img.nodeName;
				}
			}

			var img0 = container.childNodes[0].getAttribute('src');
			var img1 = container.childNodes[1].getAttribute('src');
			var img2 = container.childNodes[2].getAttribute('src');
			var img3 = container.childNodes[3].getAttribute('src');
			var img4 = container.childNodes[4].getAttribute('src');
			var img5 = container.childNodes[5].getAttribute('src');

			if (!img0.startsWith('data:image/jpeg;base64')){
				return '#images.childNodes[0] is not a base64 embed: ' + img0;
			}
			if (!img2.startsWith('data:image/png;base64')){
				return '#images.childNodes[2] is not a base64 embed: ' + img2;
			}
			if (img1 !== '/myimages/large.jpg'){
				return 'Wrong url for #images.childNodes[1]: ' + img1;
			}
			if (img3 !== '/myimages/large.png'){
				return 'Wrong url for #images.childNodes[3]: ' + img3;
			}
			if (img4 !== '/myimages/small.gif'){
				return 'Wrong url for #images.childNodes[4]: ' + img4;
			}
			if (img5 !== '/myimages/large.gif'){
				return 'Wrong url for #images.childNodes[5]: ' + img5;
			}
			return 'ok';
			/* eslint-enable */
		});
		console.log(found);
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});

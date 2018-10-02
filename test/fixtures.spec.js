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
		mode: 'development',
		entry: {
			myapp: './basic/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
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
			const el = document.getElementById('hello');
			if (el === null){
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


it('Multiple independant entries', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			app1: './multiple/app1.ts',
			app2: './multiple/app2.ts',
			app3: './multiple/app3.ts'
		},
		pages: [
			{
				filename: 'app1.html',
				chunks: ['app1']
			},
			{
				filename: 'app2.html',
				chunks: ['app2']
			},
			{
				filename: 'app3.html',
				chunks: ['app3']
			}
		]
	});
	const expectedFiles = [
		'app1.html',
		'app1.css',
		'app1.css.map',
		'app1.js',
		'app1.js.map',
		'app2.html',
		'app2.css',
		'app2.css.map',
		'app2.js',
		'app2.js.map',
		'app3.html',
		'app3.css',
		'app3.css.map',
		'app3.js',
		'app3.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	let browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:8888/app1.html`);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== `APP 1`){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', `DOM tests for app1`);
	} finally {
		await browser.close();
	}

	browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:8888/app2.html`);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== `APP 2`){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', `DOM tests for app2`);
	} finally {
		await browser.close();
	}

	browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto(`http://localhost:8888/app3.html`);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== `APP 3`){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', `DOM tests for app3`);
	} finally {
		await browser.close();
	}
});


it('Local Modules', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './local-modules/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
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
			const el = document.getElementById('hello');
			if (el === null){
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


it('Chunks', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './chunks/myapp.ts'
		}
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'chunk.0.js',
		'chunk.0.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			const el = document.getElementById('hello');
			if (el === null){
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
		mode: 'production',
		entry: {
			myapp: './css-modules/myapp.ts'
		}
	});

	let hash = '';
	for (const actualFile of actualFiles){
		const regex = /^([^.]+)\.myapp\.js$/;
		const matches = regex.exec(actualFile);
		if (matches){
			hash = matches[1];
			break;
		}
	}
	expect(hash).not.toBe('', 'Hash not found');

	const expectedFiles = [
		'index.html',
		`${hash}.myapp.css`,
		`${hash}.myapp.css.map`,
		`${hash}.myapp.js`,
		`${hash}.myapp.js.map`
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, `${hash}.myapp.css`), 'utf8');
	if (/^.([^{}]+){color:green}/.exec(cssRaw) === null){
		throw new Error('CSS is not minified');
	}

	const jsRaw = readFileSync(join(outputFolder, `${hash}.myapp.js`), 'utf8');
	expect(jsRaw.startsWith('!function(e){'), true, 'JS not minified');

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el0 = document.getElementById('hello');
			if (el0 === null){
				return '#hello not found';
			}
			if (el0.innerText !== 'Hello World'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.querySelector('script');
			if (el1 === null){
				return 'No script';
			}
			const jsCrossorigin = el1.getAttribute('crossorigin');
			const jsIntegrity = el1.getAttribute('integrity');
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
			const cssCrossorigin = el2.getAttribute('crossorigin');
			const cssIntegrity = el2.getAttribute('integrity');
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


it('Skip Postprocessing', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		entry: {
			myapp: './css-modules/myapp.ts'
		},
		mode: 'development',
		skipPostprocess: true
	});

	const expectedFiles = [
		'myapp.js',
		'myapp.js.map',
		'myapp.css',
		'myapp.css.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());
});


it('Enable sourcemaps', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-modules/myapp.ts'
		},
		sourcemaps: true
	});

	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'myapp.css',
		'myapp.css.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, 'myapp.css'), 'utf8');
	expect(cssRaw.endsWith('/*# sourceMappingURL=myapp.css.map*/')).toBe(true, 'CSS has the sourcemap');

	const jsRaw = readFileSync(join(outputFolder, 'myapp.js'), 'utf8');
	expect(jsRaw.endsWith('//# sourceMappingURL=myapp.js.map')).toBe(true, 'JS has the sourcemap');
});


it('Disable sourcemaps', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './css-modules/myapp.ts'
		},
		sourcemaps: false
	});

	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.css'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, 'myapp.css'), 'utf8');
	expect(cssRaw.endsWith('/*# sourceMappingURL=myapp.css.map*/')).toBe(false, 'CSS has no sourcemap');

	const jsRaw = readFileSync(join(outputFolder, 'myapp.js'), 'utf8');
	expect(jsRaw.endsWith('//# sourceMappingURL=myapp.js.map')).toBe(false, 'JS has no sourcemap');
});


it('Polyfills', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './polyfills/myapp.ts'
		},
		sourcemaps: false,
		polyfills: [
			'module-window-polyfill',
			'./polyfills/vanilla-polyfill.js',
			'./polyfills/typescript-polyfill.ts'
		]
	});

	const expectedFiles = [
		'index.html',
		'myapp.js'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			if (typeof window.EXAMPLE_FAKE_POLYFILL !== 'undefined'){
				return 'Fake polyfill exists';
			}
			if (window.EXAMPLE_VANILLA_POLYFILL !== 'ok once'){
				return 'Missing vanilla polyfill';
			}
			if (window.EXAMPLE_TYPESCRIPT_POLYFILL !== 'ok once'){
				return 'Missing typescript polyfill';
			}
			if (window.EXAMPLE_MODULE_POLYFILL !== 'ok once'){
				return 'Missing module polyfill';
			}
			const el = document.getElementById('hello');
			if (el === null){
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


it('Chunks & Polyfill', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './chunks-polyfills/myapp.ts'
		},
		polyfills: [
			'module-window-polyfill',
			'./polyfills/vanilla-polyfill.js',
			'./polyfills/typescript-polyfill.ts'
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.js',
		'myapp.js.map',
		'chunk.0.js',
		'chunk.0.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		await sleep(300);
		const found = await page.evaluate(() => {
			/* global document */
			/* global window */
			if (typeof window.EXAMPLE_FAKE_POLYFILL !== 'undefined'){
				return 'Fake polyfill exists';
			}
			if (window.EXAMPLE_VANILLA_POLYFILL !== 'ok once'){
				return 'Missing vanilla polyfill';
			}
			if (window.EXAMPLE_TYPESCRIPT_POLYFILL !== 'ok once'){
				return 'Missing typescript polyfill';
			}
			if (window.EXAMPLE_MODULE_POLYFILL !== 'ok once'){
				return 'Missing module polyfill';
			}
			const el = document.getElementById('hello');
			if (el === null){
				return '#hello not found';
			}
			if (el.innerText !== 'Delayed 123 ok once ok once ok once'){
				return `Bad #hello.innerText: ${el.innerText}`;
			}
			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
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


it('Inject Patterns', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './inject/myapp.ts'
		},
		sourcemaps: false,
		polyfills: [],
		publicPath: '/mypublic/',
		assetsRelativePath: 'myassets/',
		injectPatterns: [
			{
				append: false,
				assets: ['thirdparty/three.min.js', 'thirdparty/OrbitControls.js']
			},
			{
				append: true,
				assets: ['override-styles-1.css']
			},
			{
				append: true,
				publicPath: false,
				assets: ['override-styles-2.css']
			},
			{
				append: true,
				publicPath: 'custom/',
				assets: ['override-styles-3.css']
			},
			{
				append: false,
				publicPath: false,
				assets: [
					{
						type: 'css',
						path: 'http://example.com/stylesheet',
						attributes: {
							hello: 'example css'
						}
					},
					{
						type: 'js',
						path: 'http://example.com/script',
						attributes: {
							hello: 'example js'
						}
					}
				]
			}
		]
	});
	const expectedFiles = [
		'index.html',
		'myapp.js'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on('request', request => {
			const url = request.url();
			if (url.endsWith('.css')){
				request.respond({
					headers: {'Access-Control-Allow-Origin': '*'},
					content: 'text/css',
					body: '.hello{}'
				});
				return;
			}
			if (url.endsWith('.js')){
				request.respond({
					headers: {'Access-Control-Allow-Origin': '*'},
					content: 'text/javascript',
					body: 'console.log("hello");'
				});
				return;
			}
			request.continue();
		});
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const bodyChildren = document.body.childNodes;
			if (bodyChildren.length !== 6){
				return `Wrong body.children.length: ${bodyChildren.length}`;
			}

			const headChildren = document.head.childNodes;
			if (headChildren.length !== 9){
				return `Wrong head.children.length: ${headChildren.length}`;
			}

			const headChild5 = /** @type {Element} */ (headChildren[5]);
			if (headChild5.tagName !== 'LINK'){
				return `Wrong head.children[5] tagName: "${headChild5.tagName}"`;
			}
			const headChild5Href = String(headChild5.getAttribute('href'));
			if (headChild5Href !== 'http://example.com/stylesheet'){
				return `Wrong head.children[5] href: "${headChild5Href}"`;
			}
			const headChild5Hello = String(headChild5.getAttribute('hello'));
			if (headChild5Hello !== 'example css'){
				return `Wrong head.children[5] hello: "${headChild5Hello}"`;
			}

			const headChild6 = /** @type {Element} */ (headChildren[6]);
			if (headChild6.tagName !== 'LINK'){
				return `Wrong head.children[6] tagName: "${headChild6.tagName}"`;
			}
			const headChild6Href = String(headChild6.getAttribute('href'));
			if (headChild6Href !== '/mypublic/override-styles-1.css'){
				return `Wrong head.children[6] href: "${headChild6Href}"`;
			}

			const headChild7 = /** @type {Element} */ (headChildren[7]);
			if (headChild7.tagName !== 'LINK'){
				return `Wrong head.children[7] tagName: "${headChild7.tagName}"`;
			}
			const headChild7Href = String(headChild7.getAttribute('href'));
			if (headChild7Href !== 'override-styles-2.css'){
				return `Wrong head.children[7] href: "${headChild7Href}"`;
			}

			const headChild8 = /** @type {Element} */ (headChildren[8]);
			if (headChild8.tagName !== 'LINK'){
				return `Wrong head.children[8] tagName: "${headChild8.tagName}"`;
			}
			const headChild8Href = String(headChild8.getAttribute('href'));
			if (headChild8Href !== 'custom/override-styles-3.css'){
				return `Wrong head.children[8] href: "${headChild8Href}"`;
			}

			const bodyChild1 = /** @type {Element} */ (bodyChildren[1]);
			if (bodyChild1.tagName !== 'SCRIPT'){
				return `Wrong body.children[1] tagName: "${bodyChild1.tagName}"`;
			}
			const bodyChild1Src = String(bodyChild1.getAttribute('src'));
			if (bodyChild1Src !== 'http://example.com/script'){
				return `Wrong body.children[1] src: "${bodyChild1Src}"`;
			}

			const bodyChild2 = /** @type {Element} */ (bodyChildren[2]);
			if (bodyChild2.tagName !== 'SCRIPT'){
				return `Wrong body.children[2] tagName: "${bodyChild2.tagName}"`;
			}
			const bodyChild2Src = String(bodyChild2.getAttribute('src'));
			if (bodyChild2Src !== '/mypublic/thirdparty/three.min.js'){
				return `Wrong body.children[2] src: "${bodyChild2Src}"`;
			}

			const bodyChild3 = /** @type {Element} */ (bodyChildren[3]);
			if (bodyChild3.tagName !== 'SCRIPT'){
				return `Wrong body.children[3] tagName: "${bodyChild3.tagName}"`;
			}
			const bodyChild3Src = String(bodyChild3.getAttribute('src'));
			if (bodyChild3Src !== '/mypublic/thirdparty/OrbitControls.js'){
				return `Wrong body.children[3] src: "${bodyChild3Src}"`;
			}

			const bodyChild4 = /** @type {Element} */ (bodyChildren[4]);
			if (bodyChild4.tagName !== 'SCRIPT'){
				return `Wrong body.children[4] tagName: "${bodyChild4.tagName}"`;
			}
			const bodyChild4Src = String(bodyChild4.getAttribute('src'));
			if (!bodyChild4Src.startsWith('/mypublic/myapp.js')){
				return `Wrong body.children[4] src: "${bodyChild4Src}"`;
			}

			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});


it('Multiple pages', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		mode: 'development',
		sourcemaps: false,
		polyfills: [],
		entry: {
			app1: './pages/hello.ts',
			app2: './pages/world.ts'
		},
		pages: [
			{
				title: 'One',
				filename: 'page1.html',
				chunks: ['app1']
			},
			{
				title: 'Two',
				filename: 'page2.html',
				chunks: ['app2']
			},
			{
				title: 'Three',
				filename: 'page3.html'
			},
			{
				title: 'Four',
				filename: 'subfolder/page4.html'
			},
			{
				title: 'Five',
				filename: 'page5.html',
				meta: [
					{param1: 'Value 1'},
					{param2: 'Value 2'}
				]
			},
			{
				title: 'Six',
				filename: 'page6.html',
				example: 'AAAAA',
				template: join(rootFolder, 'pages/template.html')
			}
		]
	});
	const expectedFiles = [
		'app1.js',
		'app2.js',
		'page1.html',
		'page2.html',
		'page3.html',
		'subfolder/page4.html',
		'page5.html',
		'page6.html'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();

		//region page1
		await page.goto('http://localhost:8888/page1.html');
		const found1 = await page.evaluate(() => {
			/* global document */
			if (document.title !== 'One'){
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById('hello');
			if (el0 === null){
				return '#hello not found';
			}
			if (el0.innerText !== 'TITLE IS One'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById('world');
			if (el1 !== null){
				return '#world should not exist';
			}

			return 'ok';
		});
		expect(found1).toBe('ok', 'DOM tests (page1)');
		//endregion

		//region page2
		await page.goto('http://localhost:8888/page2.html');
		const found2 = await page.evaluate(() => {
			/* global document */
			if (document.title !== 'Two'){
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById('hello');
			if (el0 !== null){
				return '#hello should not exist';
			}

			const el1 = document.getElementById('world');
			if (el1 === null){
				return '#world not found';
			}
			if (el1.innerText !== 'TITLE IS Two'){
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			return 'ok';
		});
		expect(found2).toBe('ok', 'DOM tests (page2)');
		//endregion

		//region page3
		await page.goto('http://localhost:8888/page3.html');
		const found3 = await page.evaluate(() => {
			/* global document */
			if (document.title !== 'Three'){
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById('hello');
			if (el0 === null){
				return '#hello not found';
			}
			if (el0.innerText !== 'TITLE IS Three'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById('world');
			if (el1 === null){
				return '#world not found';
			}
			if (el1.innerText !== 'TITLE IS Three'){
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			return 'ok';
		});
		expect(found3).toBe('ok', 'DOM tests (page3)');
		//endregion

		//region page4
		await page.goto('http://localhost:8888/subfolder/page4.html');
		const found4 = await page.evaluate(() => {
			/* global document */
			if (document.title !== 'Four'){
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById('hello');
			if (el0 === null){
				return '#hello not found';
			}
			if (el0.innerText !== 'TITLE IS Four'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById('world');
			if (el1 === null){
				return '#world not found';
			}
			if (el1.innerText !== 'TITLE IS Four'){
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			return 'ok';
		});
		expect(found4).toBe('ok', 'DOM tests (page4)');
		//endregion

		//region page5
		await page.goto('http://localhost:8888/page5.html');
		const found5 = await page.evaluate(() => {
			/* global document */
			if (document.title !== 'Five'){
				return `Wrong title: "${document.title}"`;
			}

			const el0 = document.getElementById('hello');
			if (el0 === null){
				return '#hello not found';
			}
			if (el0.innerText !== 'TITLE IS Five'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.getElementById('world');
			if (el1 === null){
				return '#world not found';
			}
			if (el1.innerText !== 'TITLE IS Five'){
				return `Bad #world.innerText: ${el1.innerText}`;
			}

			const metas = document.querySelectorAll('meta');
			const metasLength = metas.length;
			if (metasLength < 2){
				return `Wrong metas.length: ${metasLength}`;
			}

			const meta0 = metas[metasLength - 2];
			const meta0Param = meta0.getAttribute('param1');
			if (meta0Param !== 'Value 1'){
				return `Wrong meta0.param1: ${meta0Param}`;
			}

			const meta1 = metas[metasLength - 1];
			const meta1Param = meta1.getAttribute('param2');
			if (meta1Param !== 'Value 2'){
				return `Wrong meta1.param2: ${meta1Param}`;
			}

			return 'ok';
		});
		expect(found5).toBe('ok', 'DOM tests (page5)');
		//endregion

		//region page6
		await page.goto('http://localhost:8888/page6.html');
		const found6 = await page.evaluate(() => {
			/* global document */
			if (document.title !== 'Six - Customized'){
				return `Wrong title: "${document.title}"`;
			}
			if (document.body.className !== 'customized'){
				return `Wrong body.className: "${document.body.className}"`;
			}

			const divs = document.querySelectorAll('div');
			if (divs.length !== 3){
				return `Wrong divs.length: ${divs.length}`;
			}

			const div0 = /** @type {Element} */ (divs[0]);
			if (div0.textContent !== 'Custom Option: AAAAA'){
				return `Wrong divs[0].textContent: "${div0.textContent}"`;
			}

			const div1 = /** @type {Element} */ (divs[1]);
			if (div1.textContent !== 'TITLE IS Six - Customized'){
				return `Wrong divs[1].textContent: "${div1.textContent}"`;
			}
			const div1Id = div1.getAttribute('id');
			if (div1Id !== 'hello'){
				return `Wrong divs[1].id: "${div1Id}"`;
			}

			const div2 = /** @type {Element} */ (divs[2]);
			if (div2.textContent !== 'TITLE IS Six - Customized'){
				return `Wrong divs[2].textContent: "${div2.textContent}"`;
			}
			const div2Id = div2.getAttribute('id');
			if (div2Id !== 'world'){
				return `Wrong divs[2].id: "${div2Id}"`;
			}

			return 'ok';
		});
		expect(found6).toBe('ok', 'DOM tests (page6)');
		//endregion

	} finally {
		await browser.close();
	}
}, 60000);


it('Minify & skipHashes', async() => {
	const actualFiles = await testFixture({
		rootFolder,
		outputFolder,
		skipHashes: true,
		mode: 'production',
		entry: {
			myapp: './css-modules/myapp.ts'
		}
	});

	let hash = '';
	for (const actualFile of actualFiles){
		const regex = /^([^.]+)\.myapp\.js$/;
		const matches = regex.exec(actualFile);
		if (matches){
			hash = matches[1];
			break;
		}
	}
	expect(hash).toBe('', 'Hash found');

	const expectedFiles = [
		'index.html',
		`myapp.css`,
		`myapp.css.map`,
		`myapp.js`,
		`myapp.js.map`
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());

	const cssRaw = readFileSync(join(outputFolder, `myapp.css`), 'utf8');
	if (/^.([^{}]+){color:green}/.exec(cssRaw) === null){
		throw new Error('CSS is not minified');
	}

	const jsRaw = readFileSync(join(outputFolder, `myapp.js`), 'utf8');
	expect(jsRaw.startsWith('!function(e){'), true, 'JS not minified');

	const browser = await puppeteer.launch();
	try {
		const page = await browser.newPage();
		await page.goto('http://localhost:8888/');
		const found = await page.evaluate(() => {
			/* global document */
			const el0 = document.getElementById('hello');
			if (el0 === null){
				return '#hello not found';
			}
			if (el0.innerText !== 'Hello World'){
				return `Bad #hello.innerText: ${el0.innerText}`;
			}

			const el1 = document.querySelector('script');
			if (el1 === null){
				return 'No script';
			}
			const jsCrossorigin = el1.getAttribute('crossorigin');
			if (jsCrossorigin !== null){
				return `Bad script.crossorigin: ${jsCrossorigin}`;
			}
			const jsIntegrity = el1.getAttribute('integrity');
			if (jsIntegrity !== null){
				return `Bad script.integrity: ${jsIntegrity}`;
			}

			const el2 = document.querySelector('link[rel="stylesheet"]');
			if (el2 === null){
				return 'No stylesheet';
			}

			const cssCrossorigin = el2.getAttribute('crossorigin');
			if (cssCrossorigin !== null){
				return `Bad link.crossorigin: ${cssCrossorigin}`;
			}
			const cssIntegrity = el2.getAttribute('integrity');
			if (cssIntegrity !== null){
				return `Bad link.integrity: ${cssIntegrity}`;
			}

			return 'ok';
		});
		expect(found).toBe('ok', 'DOM tests');
	} finally {
		await browser.close();
	}
});

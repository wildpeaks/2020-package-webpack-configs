/* eslint-env node, jasmine */
'use strict';
const {join, relative} = require('path');
const {mkdirSync, writeFileSync} = require('fs');
const express = require('express');
const rimraf = require('rimraf');
const rreaddir = require('recursive-readdir');
const webpack = require('webpack');
// const puppeteer = require('puppeteer');
const getConfig = require('..');
const rootFolder = join(__dirname, 'fixtures');
const outputFolder = join(__dirname, '../out-core');
let app;
let server;
const port = 8881;


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


it('Skip Reset', async() => {
	writeFileSync(join(outputFolder, 'extra-1.txt'), 'Hello World');
	writeFileSync(join(outputFolder, 'extra-2.js'), 'Hello World');
	writeFileSync(join(outputFolder, 'extra-3.ts'), 'Hello World');

	const actualFiles = await testFixture({
		skipReset: true,
		rootFolder,
		outputFolder,
		mode: 'development',
		entry: {
			myapp: './basic/myapp.ts'
		}
	});
	const expectedFiles = [
		'extra-1.txt',
		'extra-2.js',
		'extra-3.ts',
		'index.html',
		'myapp.js',
		'myapp.js.map'
	];
	expect(actualFiles.sort()).toEqual(expectedFiles.sort());
});

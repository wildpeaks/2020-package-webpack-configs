/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} outputFolder
 * @param {Boolean} expectThrows
 */
function testFixture(outputFolder, expectThrows){
	let actualThrows = false;
	try {
		getConfig({
			entry: {
				dummy: './src/dummy.ts'
			},
			outputFolder,
			rootFolder: __dirname
		});
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: __dirname', testFixture.bind(null, join(__dirname, 'dummy'), false));
it('Valid: ""', testFixture.bind(null, '', false));
it('Invalid: "myfolder"', testFixture.bind(null, 'myfolder', true));
it('Invalid: "./myfolder"', testFixture.bind(null, './myfolder', true));
it('Invalid: NaN', testFixture.bind(null, NaN, true));
it('Invalid: 123', testFixture.bind(null, 123, true));
it('Invalid: null', testFixture.bind(null, null, true));
it('Invalid: false', testFixture.bind(null, false, true));
it('Invalid: true', testFixture.bind(null, true, true));
it('Invalid: {}', testFixture.bind(null, {}, true));
it('Invalid: Promise', testFixture.bind(null, Promise.resolve(), true));
it('Invalid: Symbol', testFixture.bind(null, Symbol('hello'), true));

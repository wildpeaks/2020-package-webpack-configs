/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {Boolean} minify
 * @param {Boolean} expectThrows
 */
function testFixture(minify, expectThrows){
	let actualThrows = false;
	try {
		getConfig({
			entry: {
				dummy: './src/dummy.ts'
			},
			rootFolder: __dirname,
			outputFolder: join(__dirname, 'dummy'),
			minify
		});
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: true', testFixture.bind(null, true, false));
it('Valid: false', testFixture.bind(null, false, false));
it('Invalid: NaN', testFixture.bind(null, NaN, true));
it('Invalid: 123', testFixture.bind(null, 123, true));
it('Invalid: ""', testFixture.bind(null, '', true));
it('Invalid: {}', testFixture.bind(null, {}, true));
it('Invalid: "hello"', testFixture.bind(null, 'hello', true));
it('Invalid: null', testFixture.bind(null, null, true));
it('Invalid: Promise', testFixture.bind(null, Promise.resolve(), true));
it('Invalid: Symbol', testFixture.bind(null, Symbol('hello'), true));

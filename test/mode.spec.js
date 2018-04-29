/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} mode
 * @param {Boolean} expectThrows
 */
function testFixture(mode, expectThrows){
	let actualThrows = false;
	try {
		getConfig({
			entry: {
				dummy: './src/dummy.ts'
			},
			rootFolder: __dirname,
			outputFolder: join(__dirname, 'dummy'),
			mode
		});
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: "production"', testFixture.bind(null, 'hello', false));
it('Valid: "development"', testFixture.bind(null, 'hello', false));
it('Valid: "hello"', testFixture.bind(null, 'hello', false)); // does webpack allow arbitrary mode values ??
it('Invalid: ""', testFixture.bind(null, '', true));
it('Invalid: true', testFixture.bind(null, true, true));
it('Invalid: false', testFixture.bind(null, true, true));
it('Invalid: NaN', testFixture.bind(null, NaN, true));
it('Invalid: 123', testFixture.bind(null, 123, true));
it('Invalid: {}', testFixture.bind(null, {}, true));
it('Invalid: null', testFixture.bind(null, null, true));
it('Invalid: Promise', testFixture.bind(null, Promise.resolve(), true));
it('Invalid: Symbol', testFixture.bind(null, Symbol('hello'), true));

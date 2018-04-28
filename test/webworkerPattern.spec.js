/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String[]} webworkerPattern
 * @param {Boolean} expectThrows
 * @param {String} expectContains
 */
function testFixture(webworkerPattern, expectThrows){
	let actualThrows = false;
	try {
		getConfig({
			entry: {
				dummy: './src/dummy.ts'
			},
			rootFolder: __dirname,
			outputFolder: join(__dirname, 'dummy'),
			webworkerPattern
		});
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: /hello/', testFixture.bind(null, /hello/, false));
it('Invalid: "/hello/"', testFixture.bind(null, '/hello/', true));
it('Invalid: ""', testFixture.bind(null, '', true));
it('Invalid: {}', testFixture.bind(null, {}, true));
it('Invalid: 123', testFixture.bind(null, 123, true));
it('Invalid: "hello"', testFixture.bind(null, 'hello', true));
it('Invalid: NaN', testFixture.bind(null, NaN, true));
it('Invalid: null', testFixture.bind(null, null, true));
it('Invalid: false', testFixture.bind(null, false, true));
it('Invalid: true', testFixture.bind(null, true, true));
it('Invalid: Symbol', testFixture.bind(null, Symbol('hello'), true));

/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {Number} port
 * @param {Boolean} expectThrows
 */
function testFixture(port, expectThrows){
	let actualThrows = false;
	try {
		getConfig({
			entry: {
				dummy: './src/dummy.ts'
			},
			rootFolder: __dirname,
			outputFolder: join(__dirname, 'dummy'),
			port
		});
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: 8080', testFixture.bind(null, 8080, false));
it('Valid: 80', testFixture.bind(null, 80, false));
it('Invalid: 0', testFixture.bind(null, 0, true));
it('Invalid: -1', testFixture.bind(null, -1, true));
it('Invalid: {}', testFixture.bind(null, {}, true));
it('Invalid: NaN', testFixture.bind(null, NaN, true));
it('Invalid: ""', testFixture.bind(null, '', true));
it('Invalid: "hello"', testFixture.bind(null, 'hello', true));
it('Invalid: null', testFixture.bind(null, null, true));
it('Invalid: false', testFixture.bind(null, false, true));
it('Invalid: true', testFixture.bind(null, true, true));
it('Invalid: Symbol', testFixture.bind(null, Symbol('hello'), true));

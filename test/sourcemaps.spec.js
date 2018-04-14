/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {Boolean} sourcemaps
 * @param {Boolean} expectThrows
 */
function testFixture(sourcemaps, expectThrows){
	let actualThrows = false;
	try {
		getConfig({
			entry: {
				dummy: './src/dummy.ts'
			},
			rootFolder: __dirname,
			outputFolder: join(__dirname, 'dummy'),
			sourcemaps
		});
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: true', testFixture.bind(null, true, false));
it('Valid: false', testFixture.bind(null, true, false));
it('Invalid: ""', testFixture.bind(null, '', true));
it('Invalid: "true"', testFixture.bind(null, 'true', true));
it('Invalid: "false"', testFixture.bind(null, 'false', true));
it('Invalid: 123', testFixture.bind(null, 123, true));
it('Invalid: 0', testFixture.bind(null, 0, true));
it('Invalid: NaN', testFixture.bind(null, NaN, true));
it('Invalid: -1', testFixture.bind(null, -1, true));
it('Invalid: {}', testFixture.bind(null, {}, true));
it('Invalid: null', testFixture.bind(null, null, true));
it('Invalid: Symbol', testFixture.bind(null, Symbol('true'), true));

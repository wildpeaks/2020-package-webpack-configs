/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {Boolean} skipPostprocess
 * @param {Boolean} expectThrows
 */
function testFixture(skipPostprocess, expectThrows, useOutputFolder = true){
	let actualThrows = false;
	try {
		const options = {
			entry: {
				dummy: './src/dummy.ts'
			},
			rootFolder: __dirname,
			skipPostprocess
		};
		if (useOutputFolder){
			options.outputFolder = join(__dirname, 'dummy');
		}
		getConfig(options);
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: true (with outputFolder)', testFixture.bind(null, true, false, true));
it('Valid: true (without outputFolder)', testFixture.bind(null, true, false, false));
it('Valid: false (with outputFolder)', testFixture.bind(null, false, false, true));
it('Invalid: false (without outputFolder)', testFixture.bind(null, false, true, false));
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

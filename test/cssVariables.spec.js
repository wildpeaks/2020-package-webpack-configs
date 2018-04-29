/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} title
 * @param {Number} cssVariables
 * @param {Boolean} expectThrows
 */
function testFixture(title, cssVariables, expectThrows){
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: './src/dummy.ts'
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, 'dummy'),
				cssVariables
			});
		} catch(e){
			actualThrows = true;
		}
		expect(actualThrows).toBe(expectThrows);
	});
}

testFixture('Valid: {}', {}, false);
testFixture('Valid: {hello: 123}', {hello: 123}, false);
testFixture('Invalid: 123', 123, true);
testFixture('Invalid: ""', '', true);
testFixture('Invalid: []', [], true);
testFixture('Invalid: "hello"', 'hello', true);
testFixture('Invalid: NaN', NaN, true);
testFixture('Invalid: null', null, true);
testFixture('Invalid: false', false, true);
testFixture('Invalid: true', true, true);
testFixture('Invalid: RegExp', /hello/, true);
testFixture('Invalid: Promise', Promise.resolve(), true);
testFixture('Invalid: Symbol', Symbol('hello'), true);

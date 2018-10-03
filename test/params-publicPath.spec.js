/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} title
 * @param {String} publicPath
 * @param {Boolean} expectThrows
 */
function testFixture(title, publicPath, expectThrows){
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: './src/dummy.ts'
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, 'dummy'),
				publicPath
			});
		} catch(e){
			actualThrows = true;
		}
		expect(actualThrows).toBe(expectThrows);
	});
}

testFixture('Valid: ""', '', false);
testFixture('Valid: "hello"', 'hello', false);
testFixture('Invalid: 123', 123, true);
testFixture('Invalid: {}', {}, true);
testFixture('Invalid: NaN', NaN, true);
testFixture('Invalid: null', null, true);
testFixture('Invalid: false', false, true);
testFixture('Invalid: true', true, true);
testFixture('Invalid: Promise', Promise.resolve(), true);
testFixture('Invalid: Symbol', Symbol('hello'), true);

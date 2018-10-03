/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} title
 * @param {Number} port
 * @param {Boolean} expectThrows
 */
function testFixture(title, port, expectThrows){
	it(title, () => {
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
	});
}

testFixture('Valid: 8080', 8080, false);
testFixture('Valid: 80', 80, false);
testFixture('Invalid: 0', 0, true);
testFixture('Invalid: -1', -1, true);
testFixture('Invalid: {}', {}, true);
testFixture('Invalid: NaN', NaN, true);
testFixture('Invalid: ""', '', true);
testFixture('Invalid: "hello"', 'hello', true);
testFixture('Invalid: null', null, true);
testFixture('Invalid: false', false, true);
testFixture('Invalid: true', true, true);
testFixture('Invalid: Symbol', Symbol('hello'), true);

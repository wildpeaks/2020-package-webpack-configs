/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} title
 * @param {String[]} copyExtensions
 * @param {Boolean} expectThrows
 */
function testFixture(title, copyExtensions, expectThrows){
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: './src/dummy.ts'
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, 'dummy'),
				copyExtensions
			});
		} catch(e){
			actualThrows = true;
		}
		expect(actualThrows).toBe(expectThrows);
	});
}

testFixture('Valid: []', [], false);
testFixture('Valid: ["dummy"]', ['dummy'], false);
testFixture('Invalid: {}', {}, true);
testFixture('Invalid: 123', 123, true);
testFixture('Invalid: ""', '', true);
testFixture('Invalid: "hello"', 'hello', true);
testFixture('Invalid: NaN', NaN, true);
testFixture('Invalid: null', null, true);
testFixture('Invalid: false', false, true);
testFixture('Invalid: true', true, true);
testFixture('Invalid: Symbol', Symbol('hello'), true);

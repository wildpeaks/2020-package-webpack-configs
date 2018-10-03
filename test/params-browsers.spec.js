/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} title
 * @param {String[]} browsers
 * @param {Boolean} expectThrows
 */
function testFixture(title, browsers, expectThrows){
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: './src/dummy.ts'
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, 'dummy'),
				browsers
			});
		} catch(e){
			actualThrows = true;
		}
		expect(actualThrows).toBe(expectThrows);
	});
}

testFixture('Valid: ["last 2 versions"]', ['last 2 versions'], false);
testFixture('Invalid: ["dummy"]', ['dummy'], false);
testFixture('Invalid: []', [], true);
testFixture('Invalid: {}', {}, true);
testFixture('Invalid: 123', 123, true);
testFixture('Invalid: ""', '', true);
testFixture('Invalid: "hello"', 'hello', true);
testFixture('Invalid: NaN', NaN, true);
testFixture('Invalid: null', null, true);
testFixture('Invalid: false', false, true);
testFixture('Invalid: true', true, true);
testFixture('Invalid: Symbol', Symbol('hello'), true);

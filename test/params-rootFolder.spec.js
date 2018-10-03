/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} title
 * @param {String} rootFolder
 * @param {Boolean} expectThrows
 */
function testFixture(title, rootFolder, expectThrows){
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: './src/dummy.ts'
				},
				rootFolder,
				outputFolder: join(__dirname, 'dummy')
			});
		} catch(e){
			actualThrows = true;
		}
		expect(actualThrows).toBe(expectThrows);
	});
}

testFixture('Valid: __dirname', __dirname, false);
testFixture('Valid: ""', '', false);
testFixture('Invalid: "myfolder"', 'myfolder', true);
testFixture('Invalid: "./myfolder"', './myfolder', true);
testFixture('Invalid: NaN', NaN, true);
testFixture('Invalid: 123', 123, true);
testFixture('Invalid: null', null, true);
testFixture('Invalid: false', false, true);
testFixture('Invalid: true', true, true);
testFixture('Invalid: {}', {}, true);
testFixture('Invalid: Promise', Promise.resolve(), true);
testFixture('Invalid: Symbol', Symbol('hello'), true);

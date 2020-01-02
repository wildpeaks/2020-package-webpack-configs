/* eslint-env node */
let value1 = "INIT1";
try {
	value1 = require("fake1");
} catch(e) {
	value1 = "ERROR1";
}

console.log(`EXTERNALS COMMONJS REPLACE STRING ${value1}`);

export {};

/* eslint-env node */
const {writeFileSync} = require("fs");

let result = "INIT";
try {
	writeFileSync("example-require-fs.txt", "Require FS", "utf8");
	result = "OK";
} catch(e) {
	result = "ERROR";
}
console.log(`REQUIRE FS ${result}`);

export {};

/* eslint-env node */
const {writeFileSync} = require("fs");

let result = "INIT";
try {
	writeFileSync("example-fs-require.txt", "FS REQUIRE", "utf8");
	result = "OK";
} catch (e) {
	result = "ERROR";
}
console.log(`FS REQUIRE ${result}`);

export {};

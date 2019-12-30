/* eslint-env node */
import {writeFileSync} from "fs";

let result = "INIT";
try {
	writeFileSync("example-fs-import.txt", "FS IMPORT", "utf8");
	result = "OK";
} catch(e) {
	result = "ERROR";
}
console.log(`FS IMPORT ${result}`);

export {};

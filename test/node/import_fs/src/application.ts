/* eslint-env node */
import {writeFileSync} from "fs";

let result = "INIT";
try {
	writeFileSync("example-import-fs.txt", "Import FS", "utf8");
	result = "OK";
} catch(e) {
	result = "ERROR";
}
console.log(`IMPORT FS ${result}`);

export {};

/* eslint-env node */
import {strictEqual} from "assert";

let throws = false;
try {
	strictEqual(true, false);
} catch (e) {
	throws = true;
}
console.log(`ASSERT IMPORT ${throws ? "true" : "false"}`);

export {};

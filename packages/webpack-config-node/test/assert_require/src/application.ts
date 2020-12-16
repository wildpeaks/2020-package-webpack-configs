/* eslint-env node */
const {strictEqual} = require("assert");

let throws = false;
try {
	strictEqual(true, false);
} catch (e) {
	throws = true;
}
console.log(`ASSERT REQUIRE ${throws ? "true" : "false"}`);

export {};

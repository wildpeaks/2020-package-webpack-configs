/* eslint-env node */
console.log("CHUNKS FILENAME initially");

setTimeout(async () => {
	const {mymodule} = await import("./modules/mymodule");
	console.log(`CHUNKS FILENAME delayed ${mymodule(123)}`);
}, 1);

export {};

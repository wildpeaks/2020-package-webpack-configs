/* eslint-env node */
console.log("CHUNKS initially");

setTimeout(async () => {
	const {mymodule} = await import("./modules/mymodule");
	console.log(`CHUNKS delayed ${mymodule(123)}`);
}, 1);

export {};

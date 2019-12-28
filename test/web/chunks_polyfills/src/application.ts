/* eslint-env browser */

const container1 = document.createElement("div");
container1.setAttribute("id", "mocha1");
container1.innerHTML = [
	"CHUNKS POLYFILLS",
	// @ts-ignore
	typeof window.EXAMPLE_FAKE_POLYFILL,
	// @ts-ignore
	window.EXAMPLE_VANILLA_POLYFILL,
	window.EXAMPLE_TYPESCRIPT_POLYFILL,
	// @ts-ignore
	window.EXAMPLE_MODULE_POLYFILL
].join(" ");
document.body.appendChild(container1);

const container2 = document.createElement("div");
container2.setAttribute("id", "mocha2");
container2.innerHTML = "Initially";
document.body.appendChild(container2);
setTimeout(async () => {
	const {mymodule} = await import("./modules/mymodule");
	container2.innerText = `Delayed ${mymodule(123)}`;
});

export {};

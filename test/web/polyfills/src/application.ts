/* eslint-env browser */
const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = "Polyfills";
document.body.appendChild(container);

// @ts-ignore
if (typeof window.EXAMPLE_FAKE_POLYFILL !== "undefined") {
	const div = document.createElement("div");
	div.innerText = "Fake polyfill exists";
	container.appendChild(div);
}

// @ts-ignore
if (window.EXAMPLE_VANILLA_POLYFILL !== "ok once") {
	const div = document.createElement("div");
	div.innerText = "Missing vanilla polyfill";
	container.appendChild(div);
}

const div1 = document.createElement("div");
const div2 = document.createElement("div");
const div3 = document.createElement("div");
const div4 = document.createElement("div");
// @ts-ignore
div1.innerHTML = `EXAMPLE_FAKE_POLYFILL ${window.EXAMPLE_FAKE_POLYFILL}`;
// @ts-ignore
div2.innerHTML = `EXAMPLE_VANILLA_POLYFILL ${window.EXAMPLE_VANILLA_POLYFILL}`;
div3.innerHTML = `EXAMPLE_TYPESCRIPT_POLYFILL ${window.EXAMPLE_TYPESCRIPT_POLYFILL}`;
// @ts-ignore
div4.innerHTML = `EXAMPLE_MODULE_POLYFILL ${window.EXAMPLE_MODULE_POLYFILL}`;
container.appendChild(div1);
container.appendChild(div2);
container.appendChild(div3);
container.appendChild(div4);

export {};

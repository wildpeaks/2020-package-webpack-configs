/* eslint-disable */
const MyWorker = require("./application.webworker");

const mydiv1 = document.createElement("div");
mydiv1.setAttribute("id", "mocha1");
// @ts-ignore
mydiv1.innerHTML = [
	// @ts-ignore
	String(window.EXAMPLE_BOTH_POLYFILL),
	// @ts-ignore
	String(window.EXAMPLE_WORKER_POLYFILL),
	// @ts-ignore
	String(window.EXAMPLE_MAIN_POLYFILL),
	// @ts-ignore
	String(window.EXAMPLE_MODULE_POLYFILL)
].join(" ");
document.body.appendChild(mydiv1);

const mydiv2 = document.createElement("div");
mydiv2.setAttribute("id", "mocha2");
mydiv2.innerHTML = "Initially";
document.body.appendChild(mydiv2);

const myworker: Worker = new MyWorker();
myworker.onmessage = (response) => {
	mydiv2.innerHTML = String(response.data);
};
myworker.postMessage({
	hello: 123
});

export {};

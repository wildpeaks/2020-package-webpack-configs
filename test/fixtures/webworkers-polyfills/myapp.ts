/* eslint-disable */
const MyWorker = require('./myapp.webworker');

const mydiv1 = document.createElement('div');
mydiv1.setAttribute('id', 'hello1');
// @ts-ignore
mydiv1.innerText = [
	// @ts-ignore
	String(window.EXAMPLE_BOTH_POLYFILL),
	// @ts-ignore
	String(window.EXAMPLE_WORKER_POLYFILL),
	// @ts-ignore
	String(window.EXAMPLE_MAIN_POLYFILL),
	// @ts-ignore
	String(window.EXAMPLE_MODULE_POLYFILL)
].join(' ');
document.body.appendChild(mydiv1);

const mydiv2 = document.createElement('div');
mydiv2.setAttribute('id', 'hello2');
mydiv2.innerText = 'Initially';
document.body.appendChild(mydiv2);

const myworker: Worker = new MyWorker();
myworker.onmessage = response => {
	mydiv2.innerText = String(response.data);
};
myworker.postMessage({
	hello: 123
});

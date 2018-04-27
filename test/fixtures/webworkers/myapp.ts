/* eslint-env browser */
const RelativeWorker = require('./relative.webworker');
const ModuleWorker = require('my-worker-module');

const mydiv1 = document.createElement('div');
mydiv1.setAttribute('id', 'hello1'); // why not found ???
mydiv1.innerText = 'Initially 1';
document.body.appendChild(mydiv1);

const mydiv2 = document.createElement('div');
mydiv2.setAttribute('id', 'hello2');
mydiv2.innerText = 'Initially 2';
document.body.appendChild(mydiv2);

const worker1: Worker = new RelativeWorker();
worker1.onmessage = response => {
	mydiv1.innerText = String(response.data);
};
worker1.postMessage({
	hello: 'HELLO 1'
});

const worker2: Worker = new ModuleWorker();
worker2.onmessage = response => {
	mydiv2.innerText = String(response.data);
};
worker2.postMessage({
	hello: 'HELLO 2'
});

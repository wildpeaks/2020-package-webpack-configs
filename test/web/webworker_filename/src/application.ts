/* eslint-env browser */
const MyWorkerWorker = require("./myworker.webworker");

const mydiv = document.createElement("div");
mydiv.setAttribute("id", "mocha");
mydiv.innerText = "Initially";
document.body.appendChild(mydiv);

const myworker: Worker = new MyWorkerWorker();
myworker.onmessage = response => {
	mydiv.innerText = String(response.data);
};
myworker.postMessage({
	hello: "HELLO"
});

export {};

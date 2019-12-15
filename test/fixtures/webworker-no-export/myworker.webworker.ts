/* eslint-env worker */
const worker: Worker = self as any;

worker.addEventListener("message", e => {
	worker.postMessage("WORKER replies " + e.data.hello);
});

export {};

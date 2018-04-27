/* eslint-env worker */
const worker: Worker = self as any;

worker.addEventListener('message', e => {
	worker.postMessage('RELATIVE WORKER replies ' + e.data.hello);
});

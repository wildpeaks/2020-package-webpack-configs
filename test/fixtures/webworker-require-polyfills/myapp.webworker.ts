/* eslint-disable */
const worker: Worker = self as any;

worker.addEventListener("message", _e => {
	const response = [
		// @ts-ignore
		String(self.EXAMPLE_BOTH_POLYFILL),
		// @ts-ignore
		String(self.EXAMPLE_WORKER_POLYFILL),
		// @ts-ignore
		String(self.EXAMPLE_MAIN_POLYFILL),
		// @ts-ignore
		String(self.EXAMPLE_MODULE_POLYFILL)
	].join(" ");
	worker.postMessage(response);
});

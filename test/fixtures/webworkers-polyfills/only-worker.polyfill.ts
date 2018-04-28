'use strict';
// @ts-ignore
if (typeof self.EXAMPLE_WORKER_POLYFILL !== 'undefined'){
	// @ts-ignore
	self.EXAMPLE_WORKER_POLYFILL = 'WORKER multiple';
} else {
	// @ts-ignore
	self.EXAMPLE_WORKER_POLYFILL = 'WORKER once';
}

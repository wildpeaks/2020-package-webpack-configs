/* eslint-env browser*/
'use strict';

interface Window {
	EXAMPLE_TYPESCRIPT_POLYFILL: string;
}
if (typeof window.EXAMPLE_TYPESCRIPT_POLYFILL !== 'undefined'){
	window.EXAMPLE_TYPESCRIPT_POLYFILL = 'ok multiple';
} else {
	window.EXAMPLE_TYPESCRIPT_POLYFILL = 'ok once';
}

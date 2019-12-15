export function mymodule(param1: number): string {
	return `${param1} ${window.EXAMPLE_VANILLA_POLYFILL} ${window.EXAMPLE_TYPESCRIPT_POLYFILL} ${window.EXAMPLE_MODULE_POLYFILL}`;
}

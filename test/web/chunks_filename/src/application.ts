/* eslint-env browser */
const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = `CHUNKS FILENAME initially`;
document.body.appendChild(container);

setTimeout(async () => {
	const {mymodule} = await import("./modules/mymodule");
	container.innerText = `CHUNKS FILENAME delayed ${mymodule(123)}`;
});

export {};

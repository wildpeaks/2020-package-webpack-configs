/* eslint-env browser */
let tmp = "init";
try {
	tmp = process.cwd();
} catch (e) {
	tmp = "runtime error";
}

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = `NODE CWD ${tmp}`;
document.body.appendChild(container);

export {};

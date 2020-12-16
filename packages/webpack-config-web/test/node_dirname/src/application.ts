/* eslint-env browser */
const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = `NODE DIRNAME ${__dirname}`;
document.body.appendChild(container);

export {};

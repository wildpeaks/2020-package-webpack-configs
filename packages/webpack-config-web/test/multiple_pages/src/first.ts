/* eslint-env browser */
const mydiv = document.createElement("div");
mydiv.setAttribute("id", "mocha1");
mydiv.innerHTML = "FIRST " + document.title;
document.body.appendChild(mydiv);

export {};

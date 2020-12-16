/* eslint-env browser */
const mydiv = document.createElement("div");
mydiv.setAttribute("id", "mocha2");
mydiv.innerHTML = "SECOND " + document.title;
document.body.appendChild(mydiv);

export {};

/* eslint-env browser */
import "./application.css";

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.setAttribute("class", "myclass");
container.innerText = "CSS No Modules";
document.body.appendChild(container);

export {};

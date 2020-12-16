/* eslint-env browser */
import {myclass} from "./application.css";

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.className = myclass;
container.innerText = "Production";
document.body.appendChild(container);

export {};

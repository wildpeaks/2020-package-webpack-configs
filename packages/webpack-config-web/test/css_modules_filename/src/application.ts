/* eslint-env browser */
import {myclass} from "./application.css";

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.setAttribute("class", myclass);
container.innerText = "CSS Modules Filename";
document.body.appendChild(container);

export {};

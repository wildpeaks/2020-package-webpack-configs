/* eslint-env browser */
import {join} from "path";

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = "NODE PATH " + join(__dirname, "hello/world.txt");
document.body.appendChild(container);

export {};

/* eslint-env browser */
import {format} from "url";

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = "NODE URL " + format({protocol: "https", host: "example.com"});
document.body.appendChild(container);

export {};

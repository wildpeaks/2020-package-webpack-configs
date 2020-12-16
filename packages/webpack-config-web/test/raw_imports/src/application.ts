/* eslint-env browser */
import raw1 from "./file1.txt";
import raw2 from "./file2.liquid";

const container = document.createElement("div");
container.setAttribute("id", "mocha");
document.body.appendChild(container);

const mydiv1 = document.createElement("div");
mydiv1.setAttribute("id", "hello1");
mydiv1.innerHTML = raw1;
container.appendChild(mydiv1);

const mydiv2 = document.createElement("div");
mydiv2.setAttribute("id", "hello2");
mydiv2.innerHTML = raw2;
container.appendChild(mydiv2);

export {};

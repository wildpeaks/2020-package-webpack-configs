/* eslint-env browser */
import raw1 from "./file1.txt";
import raw2 from "./file2.liquid";

const mydiv1 = document.createElement("div");
mydiv1.setAttribute("id", "hello1");
mydiv1.innerText = raw1;
document.body.appendChild(mydiv1);

const mydiv2 = document.createElement("div");
mydiv2.setAttribute("id", "hello2");
mydiv2.innerText = raw2;
document.body.appendChild(mydiv2);

export {};


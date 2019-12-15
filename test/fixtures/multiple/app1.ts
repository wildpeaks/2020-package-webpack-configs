/* eslint-env browser */
import {myclass} from "./app1.css";

const mydiv = document.createElement("div");
mydiv.setAttribute("id", "hello");
mydiv.className = myclass;
mydiv.innerText = "APP 1";
document.body.appendChild(mydiv);

export {};

/* eslint-env browser */
import * as css from "./myapp.css";
const {myclass} = css as {
	myclass: string;
};

const mydiv = document.createElement("div");
mydiv.setAttribute("id", "hello");
mydiv.className = myclass;
mydiv.innerText = "Hello World";
document.body.appendChild(mydiv);

export {};

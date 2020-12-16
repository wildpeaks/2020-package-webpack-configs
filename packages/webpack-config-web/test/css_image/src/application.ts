/* eslint-env browser */
import * as css from "./application.css";
const {myclass} = css as {
	myclass: string;
};

const mydiv = document.createElement("div");
mydiv.setAttribute("id", "mocha");
mydiv.className = myclass;
mydiv.innerText = "CSS Image";
document.body.appendChild(mydiv);

export {};

/* eslint-env browser */
import * as css from "./application.scss";
const {myclass} = css as {
	myclass: string;
};

const mydiv = document.createElement("div");
mydiv.setAttribute("id", "mocha");
mydiv.className = myclass;
mydiv.innerText = "SCSS Image";
document.body.appendChild(mydiv);

export {};

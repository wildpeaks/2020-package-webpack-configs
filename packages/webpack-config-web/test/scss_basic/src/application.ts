/* eslint-env browser */
import * as css from "./application.scss";
const {myclass} = css as {
	myclass: string;
};

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.className = myclass;
container.innerText = "SCSS Basic";
document.body.appendChild(container);

export {};

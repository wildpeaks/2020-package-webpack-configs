/* eslint-env browser */
import {mysync} from "./sync.scss";
const mydiv = document.createElement("div");
mydiv.setAttribute("id", "mocha");
document.body.appendChild(mydiv);

mydiv.className = mysync;
mydiv.innerText = "Sync";

setTimeout(async () => {
	const {myasync} = await import("./async.scss");
	mydiv.className = myasync;
	mydiv.innerText = "Async";
});

export {};

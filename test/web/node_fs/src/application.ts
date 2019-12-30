/* eslint-env browser */
import {writeFileSync} from "fs";

let throws = false;
try {
	writeFileSync("node-fs-example.txt", "NODE FS example", "utf8");
} catch(e) {
	throws = true;
}

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = `NODE FS ${throws ? "true" : "false"}`;
document.body.appendChild(container);

export {};

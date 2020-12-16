/* eslint-env browser */
import {strictEqual} from "assert";

let throws1 = false;
try {
	strictEqual(true, true);
} catch (e) {
	throws1 = true;
}

let throws2 = false;
try {
	strictEqual(true, false);
} catch (e) {
	throws2 = true;
}

const container = document.createElement("div");
container.setAttribute("id", "mocha");
container.innerText = `NODE ASSERT ${throws1} ${throws2}`;
document.body.appendChild(container);

export {};

/* eslint-env browser */
import srcSmallJpg from "./small.jpg";
import srcLargeJpg from "./large.jpg";
import srcSmallPng from "./small.png";
import srcLargePng from "./large.png";
import srcSmallGif from "./small.gif";
import srcLargeGif from "./large.gif";
import srcSmallJson from "./small.json";
import srcLargeJson from "./large.json";

const container = document.createElement("div");
container.setAttribute("id", "mocha");
document.body.appendChild(container);

const imgSmallJpg = document.createElement("img");
imgSmallJpg.src = srcSmallJpg;
container.appendChild(imgSmallJpg);

const imgLargeJpg = document.createElement("img");
imgLargeJpg.src = srcLargeJpg;
container.appendChild(imgLargeJpg);

const imgSmallPng = document.createElement("img");
imgSmallPng.src = srcSmallPng;
container.appendChild(imgSmallPng);

const imgLargePng = document.createElement("img");
imgLargePng.src = srcLargePng;
container.appendChild(imgLargePng);

const imgSmallGif = document.createElement("img");
imgSmallGif.src = srcSmallGif;
container.appendChild(imgSmallGif);

const imgLargeGif = document.createElement("img");
imgLargeGif.src = srcLargeGif;
container.appendChild(imgLargeGif);

const divSmallJson = document.createElement("div");
divSmallJson.innerText = String(srcSmallJson);
container.appendChild(divSmallJson);

const divLargeJson = document.createElement("div");
divLargeJson.innerText = String(srcLargeJson);
container.appendChild(divLargeJson);

export {};

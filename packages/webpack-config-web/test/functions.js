/* eslint-env node, browser */
"use strict";
const snapshotScript = require.resolve("@wildpeaks/snapshot-dom/lib/browser.js");

// function sleep(duration) {
// 	return new Promise((resolve) => {
// 		setTimeout(() => {
// 			resolve();
// 		}, duration);
// 	});
// }
// module.exports.sleep = sleep;

async function getSnapshot(engine, url) {
	let tree;
	const browser = await engine.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(url, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		tree = await page.evaluate(() => window.snapshotToJSON(document.getElementById("mocha")));
	} finally {
		await browser.close();
	}
	if (tree === null || typeof tree !== "object") {
		throw new Error("Failed to snapshot #mocha element");
	}
	return tree.childNodes;
}
module.exports.getSnapshot = getSnapshot;

async function getSnapshotLinkScriptTags(engine, url) {
	let tags;
	const browser = await engine.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(url, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		tags = await page.evaluate(() => {
			const children = [...document.getElementsByTagName("link"), ...document.getElementsByTagName("script")];
			return children.map(window.snapshotToJSON);
		});
	} finally {
		await browser.close();
	}
	return tags;
}
module.exports.getSnapshotLinkScriptTags = getSnapshotLinkScriptTags;

async function getSnapshotMetaTags(engine, url) {
	let tags;
	const browser = await engine.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(url, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		tags = await page.evaluate(() => {
			const children = [...document.getElementsByTagName("meta")];
			return children.map(window.snapshotToJSON);
		});
	} finally {
		await browser.close();
	}
	return tags;
}
module.exports.getSnapshotMetaTags = getSnapshotMetaTags;

async function getSnapshotMultiple(engine, url) {
	let tree1;
	let tree2;
	const browser = await engine.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(url, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		tree1 = await page.evaluate(() => {
			const el1 = document.getElementById("mocha1");
			if (el1) {
				return window.snapshotToJSON(el1).childNodes;
			}
			return "NOT FOUND";
		});
		tree2 = await page.evaluate(() => {
			const el2 = document.getElementById("mocha2");
			if (el2) {
				return window.snapshotToJSON(el2).childNodes;
			}
			return "NOT FOUND";
		});
	} finally {
		await browser.close();
	}
	return {
		mocha1: tree1,
		mocha2: tree2
	};
}
module.exports.getSnapshotMultiple = getSnapshotMultiple;

async function getSnapshotColor(engine, url) {
	let color;
	const browser = await engine.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(url, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		color = await page.evaluate(() => {
			const el = document.getElementById("mocha");
			if (el === null) {
				return "#mocha not found";
			}
			const computed = window.getComputedStyle(el);
			return computed.getPropertyValue("color");
		});
	} finally {
		await browser.close();
	}
	return color;
}
module.exports.getSnapshotColor = getSnapshotColor;

async function getSnapshotMultipleColor(engine, url) {
	let color1;
	let color2;
	const browser = await engine.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(url, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		color1 = await page.evaluate(() => {
			const computed = window.getComputedStyle(document.body);
			return computed.getPropertyValue("color");
		});
		color2 = await page.evaluate(() => {
			const el = document.getElementById("mocha");
			if (el === null) {
				return "#mocha not found";
			}
			const computed = window.getComputedStyle(el);
			return computed.getPropertyValue("color");
		});
	} finally {
		await browser.close();
	}
	return {
		body: color1,
		mocha: color2
	};
}
module.exports.getSnapshotMultipleColor = getSnapshotMultipleColor;

async function getSnapshotImage(engine, url) {
	let color;
	const browser = await engine.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();
		await page.goto(url, {waitUntil: "networkidle"});
		await page.addScriptTag({path: snapshotScript});
		color = await page.evaluate(() => {
			const el = document.getElementById("mocha");
			if (el === null) {
				return "#mocha not found";
			}
			const computed = window.getComputedStyle(el);
			return computed.getPropertyValue("background-image");
		});
	} finally {
		await browser.close();
	}
	return color;
}
module.exports.getSnapshotImage = getSnapshotImage;

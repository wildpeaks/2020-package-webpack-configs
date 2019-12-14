/* eslint-env node */
"use strict";
const {join} = require("path");
const {writeFileSync} = require("fs");
const {removeSync, mkdirpSync} = require("fs-extra");
const {devDependencies} = require("../package.json");
const tmpFolder = join(__dirname, `tmp`);
const {execCommand} = require("./shared");

async function setupFolder(id, extraPackages) {
	const targetFolder = join(tmpFolder, id);
	try {
		removeSync(targetFolder);
	} catch (e) {
		//
	}
	mkdirpSync(targetFolder);

	// eslint-disable-next-line global-require
	const {dependencies} = require(`../packages/tsconfig-${id}/package.json`);
	const settings = {
		private: true,
		dependencies
	};
	for (const packageId of extraPackages) {
		settings.dependencies[packageId] = devDependencies[packageId];
	}
	writeFileSync(join(targetFolder, "package.json"), JSON.stringify(settings), "utf8");

	const {output, errors} = await execCommand("npm install --no-save", targetFolder);
	console.log(output.join("\n"));
	if (errors.length > 0) {
		throw new Error(errors);
	}
}

async function main() {
	await setupFolder("node", ["typescript"]);
	await setupFolder("web", ["typescript", "preact", "webpack", "webpack-cli", "@wildpeaks/webpack-config-web"]);
}
main().then(
	() => {
		console.log("[OK] Done.");
	},
	e => {
		console.log("[ERROR]", e);
	}
);

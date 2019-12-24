/* eslint-env node */
"use strict";
const {join} = require("path");
const {writeFileSync} = require("fs");
const {removeSync, mkdirpSync} = require("fs-extra");
const {execCommand} = require("./shared");
const {devDependencies} = require("../package.json");
const {dependencies} = require(`../packages/webpack-config-web/package.json`);

async function main() {
	const settings = {
		private: true,
		dependencies
	};
	const extraPackages = ["typescript", "webpack", "webpack-cli"];
	for (const packageId of extraPackages) {
		settings.dependencies[packageId] = devDependencies[packageId];
	}

	const tmpFolder = join(__dirname, "../tmp");
	removeSync(tmpFolder);
	mkdirpSync(tmpFolder);
	writeFileSync(join(tmpFolder, "package.json"), JSON.stringify(settings), "utf8");

	const {output, errors} = await execCommand("npm install --no-save", tmpFolder);
	console.log(output.join("\n"));
	if (errors.length > 0) {
		throw new Error(errors);
	}
}

main().then(
	() => {
		console.log("[OK] Done.");
	},
	e => {
		console.log("[ERROR]", e);
	}
);

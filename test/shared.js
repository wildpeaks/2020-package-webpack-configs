/* eslint-env node */
"use strict";
const {exec} = require("child_process");
const {existsSync} = require("fs");
const {join, relative} = require("path");
const {copySync, removeSync, outputFileSync} = require("fs-extra");
const rreaddir = require("recursive-readdir");

/**
 * @param {String} folder
 */
async function getFiles(folder) {
	const files = await rreaddir(folder);
	return files
		.map(filepath => relative(folder, filepath).replace(/\\/g, "/"))
		.sort()
		.filter(filepath => filepath.startsWith("node_modules/fake") || !filepath.startsWith("node_modules"));
}

/**
 * @param {String} folder
 */
async function compileFixture(folder, extras = false) {
	const tmpFolder = join(__dirname, "../tmp");
	removeSync(join(tmpFolder, "src"));
	removeSync(join(tmpFolder, "lib"));
	removeSync(join(tmpFolder, "dist"));
	removeSync(join(tmpFolder, "webpack.config.js"));
	removeSync(join(tmpFolder, "node_modules/module-window-polyfill"));
	removeSync(join(tmpFolder, "node_modules/module-self-polyfill"));
	removeSync(join(tmpFolder, "node_modules/example-theme-module"));

	// prettier-ignore
	copySync(
		join(folder, "src"),
		join(tmpFolder, "src")
	);
	// prettier-ignore
	if (existsSync(join(folder, "node_modules/module-window-polyfill"))) {
		copySync(
			join(folder, "node_modules/module-window-polyfill"),
			join(tmpFolder, "node_modules/module-window-polyfill")
		);
	}
	// prettier-ignore
	if (existsSync(join(folder, "node_modules/module-self-polyfill"))) {
		copySync(
			join(folder, "node_modules/module-self-polyfill"),
			join(tmpFolder, "node_modules/module-self-polyfill")
		);
	}
	// prettier-ignore
	if (existsSync(join(folder, "node_modules/example-theme-module"))) {
		copySync(
			join(folder, "node_modules/example-theme-module"),
			join(tmpFolder, "node_modules/example-theme-module")
		);
	}
	// prettier-ignore
	copySync(
		join(folder, "webpack.config.js"),
		join(tmpFolder, "webpack.config.js")
	);
	// prettier-ignore
	outputFileSync(
		join(tmpFolder, "package.json"),
		JSON.stringify({private: true, scripts: {build: "webpack"}}),
		"utf8"
	);

	if (extras) {
		outputFileSync(join(tmpFolder, "dist/extra-1.txt"), "Hello World");
		outputFileSync(join(tmpFolder, "dist/extra-2.js"), "Hello World");
		outputFileSync(join(tmpFolder, "dist/extra-3.ts"), "Hello World");
	}

	const filesBefore = await getFiles(tmpFolder);
	const {output, errors} = await execCommand("npm run build", tmpFolder, 20000);
	const filesAfter = await getFiles(tmpFolder);

	return {
		output,
		errors,
		filesBefore,
		filesAfter
	};
}

/**
 * @param {String} command
 * @param {String} cwd
 */
function execCommand(command, cwd, timeout = 0) {
	return new Promise(resolve => {
		exec(command, {cwd, timeout}, (error, stdout, stderr) => {
			const output = stdout
				.trim()
				.split("\n")
				.map(line => line.trim())
				.filter(line => line !== "");
			const errors = stderr
				.trim()
				.split("\n")
				.map(line => line.trim())
				.filter(line => line !== "");
			if (error) {
				errors.push(error);
			}
			resolve({output, errors});
		});
	});
}

module.exports = {
	compileFixture,
	execCommand
};

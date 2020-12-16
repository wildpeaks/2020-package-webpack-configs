/* eslint-env node */
"use strict";
const {deepStrictEqual} = require("assert");
const {exec} = require("child_process");
const {mkdirSync} = require("fs");
const {removeSync, outputFileSync} = require("fs-extra");
const {join, relative} = require("path");
const rreaddir = require("recursive-readdir");

async function getFiles(folder) {
	const files = await rreaddir(folder);
	return files
		.map((filepath) => relative(folder, filepath).replace(/\\/g, "/"))
		.sort()
		.filter((filepath) => filepath.startsWith("node_modules/fake") || !filepath.startsWith("node_modules"));
}

function execCommand(command, cwd) {
	const actualCwd = cwd || process.cwd();
	return new Promise((resolve) => {
		exec(command, {cwd: actualCwd}, (error, stdout, stderr) => {
			const output = stdout
				.trim()
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line !== "");
			const errors = stderr
				.trim()
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line !== "");
			if (error) {
				errors.push(error);
			}
			resolve({output, errors});
		});
	});
}

async function build({id, extras, expectError, expectFiles}) {
	const dist = join(process.cwd(), `test/${id}/dist`);
	removeSync(dist);
	if (extras) {
		mkdirSync(dist);
		outputFileSync(join(dist, "extra-1.txt"), "Hello World");
		outputFileSync(join(dist, "extra-2.js"), "Hello World");
		outputFileSync(join(dist, "extra-3.ts"), "Hello World");
	}
	const {errors} = await execCommand(`webpack --config test/${id}/webpack.config.js`);
	if (expectError) {
		if (errors.length === 0) {
			throw new Error("Expected a build error");
		}
		return;
	}
	deepStrictEqual(errors, [], "No build error");
	if (expectFiles) {
		const actualFiles = await getFiles(dist);
		deepStrictEqual(actualFiles.sort(), expectFiles.sort(), "Generated files");
	}
}

async function runNodeScript({filepath, cwd, expectError, expectOutput}) {
	const runtime = await execCommand(`node ${filepath}`, cwd);
	if (expectError) {
		if (runtime.errors.length === 0) {
			throw new Error("Expected a runtime error");
		}
		return;
	}
	deepStrictEqual(runtime, {errors: [], output: expectOutput});
}

module.exports.getFiles = getFiles;
module.exports.execCommand = execCommand;
module.exports.build = build;
module.exports.runNodeScript = runNodeScript;

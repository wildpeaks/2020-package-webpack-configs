/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual} = require("assert");
const {readFileSync} = require("fs");
const {join} = require("path");
const {getFiles, build, runNodeScript} = require("../../functions");

describe("Core", function () {
	it("Basic", async function () {
		const id = "basic";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-basic.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-basic.js",
			expectOutput: ["Basic"]
		});
	});

	it("Custom Filename", async function () {
		const id = "basic_filename";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({
			id,
			expectFiles: ["subfolder/custom.app-basic-filename.js"]
		});
		await runNodeScript({
			cwd: dist,
			filepath: "subfolder/custom.app-basic-filename.js",
			expectOutput: ["Basic Filename"]
		});
	});

	it("Multiple independent entries", async function () {
		const id = "multiple_entry";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-multiple-1.js", "app-multiple-2.js", "app-multiple-3.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-multiple-1.js",
			expectOutput: ["Multiple 1"]
		});
		await runNodeScript({
			cwd: dist,
			filepath: "app-multiple-2.js",
			expectOutput: ["Multiple 2"]
		});
		await runNodeScript({
			cwd: dist,
			filepath: "app-multiple-3.js",
			expectOutput: ["Multiple 3"]
		});
	});

	it("Sourcemaps", async function () {
		const id = "sourcemaps";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-sourcemaps.js", "app-sourcemaps.js.map"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-sourcemaps.js",
			expectOutput: ["Sourcemaps"]
		});
	});

	it("Chunks", async function () {
		const id = "chunks";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-chunks.js", "chunk.0.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-chunks.js",
			expectOutput: ["CHUNKS initially", "CHUNKS delayed 100123"]
		});
	});

	it("Chunks: Custom Filename", async function () {
		const id = "chunks_filename";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id, expectFiles: ["app-chunks-filename.js", "subfolder/custom.chunk.0.js"]});
		await runNodeScript({
			cwd: dist,
			filepath: "app-chunks-filename.js",
			expectOutput: ["CHUNKS FILENAME initially", "CHUNKS FILENAME delayed 100123"]
		});
	});

	it("Production mode", async function () {
		const id = "production";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id});
		const actualFiles = await getFiles(dist);

		let hash = "";
		for (const actualFile of actualFiles) {
			const regex = /^([^.]+)\.app-production\.js$/;
			const matches = regex.exec(actualFile);
			if (matches) {
				hash = matches[1];
				break;
			}
		}
		if (hash === "") {
			throw new Error("No hash found");
		}

		const expectedFiles = [`${hash}.app-production.js`];
		deepStrictEqual(actualFiles.sort(), expectedFiles.sort(), "Generated files");

		const jsRaw = readFileSync(join(dist, `${hash}.app-production.js`), "utf8");
		if (!jsRaw.startsWith("!function(")) {
			throw new Error("JS is not minified");
		}
		await runNodeScript({
			cwd: dist,
			filepath: `${hash}.app-production.js`,
			expectOutput: ["Production"]
		});
	});

	it("Production mode & Skip hashes", async function () {
		const id = "production_skip_hashes";
		const dist = join(process.cwd(), `test/${id}/dist`);
		await build({id});
		const actualFiles = await getFiles(dist);

		let hash = "";
		for (const actualFile of actualFiles) {
			const regex = /^([^.]+)\.app-production-skip-hashes\.js$/;
			const matches = regex.exec(actualFile);
			if (matches) {
				hash = matches[1];
				break;
			}
		}
		if (hash !== "") {
			throw new Error("Hashes were not skipped");
		}

		const expectedFiles = ["app-production-skip-hashes.js"];
		deepStrictEqual(actualFiles.sort(), expectedFiles.sort(), "Generated files");

		const jsRaw = readFileSync(join(dist, "app-production-skip-hashes.js"), "utf8");
		if (!jsRaw.startsWith("!function(")) {
			throw new Error("JS is not minified");
		}
		await runNodeScript({
			cwd: dist,
			filepath: "app-production-skip-hashes.js",
			expectOutput: ["Production Skip Hashes"]
		});
	});
});

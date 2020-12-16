/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const {join} = require("path");
const getConfig = require("..");

function test_assetFilename(title, assetFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				assetFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_copyExtensions(title, copyExtensions, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				copyExtensions
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_copyPatterns(title, copyPatterns, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				copyPatterns
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_cssChunkFilename(title, cssChunkFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				cssChunkFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_cssFilename(title, cssFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				cssFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_cssModules(title, cssModules, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				cssModules
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_embedExtensions(title, embedExtensions, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				embedExtensions
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_embedLimit(title, embedLimit, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				embedLimit
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_entry(title, entry, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry,
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_injectPatterns(title, injectPatterns, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				injectPatterns
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_jsChunkFilename(title, jsChunkFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				jsChunkFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_jsFilename(title, jsFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				jsFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_mode(title, mode, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				mode
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_outputFolder(title, outputFolder, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				outputFolder,
				rootFolder: __dirname
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_polyfills(title, polyfills, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				polyfills
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_port(title, port, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				port
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_publicPath(title, publicPath, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				publicPath
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_rawExtensions(title, rawExtensions, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				rawExtensions
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_rootFolder(title, rootFolder, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder,
				outputFolder: join(__dirname, "dummy")
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_skipHashes(title, skipHashes, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				skipHashes
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_skipPostprocess(title, skipPostprocess, expectThrows, useOutputFolder = true) {
	it(title, () => {
		let actualThrows = false;
		try {
			const options = {
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				skipPostprocess
			};
			if (useOutputFolder) {
				options.outputFolder = join(__dirname, "dummy");
			}
			getConfig(options);
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_skipReset(title, skipReset, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				skipReset
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_sourcemaps(title, sourcemaps, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				sourcemaps
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_webworkerFilename(title, webworkerFilename, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				webworkerFilename
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_webworkerPattern(title, webworkerPattern, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				webworkerPattern
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

function test_webworkerPolyfills(title, webworkerPolyfills, expectThrows) {
	it(title, () => {
		let actualThrows = false;
		try {
			getConfig({
				entry: {
					dummy: "./src/dummy.ts"
				},
				rootFolder: __dirname,
				outputFolder: join(__dirname, "dummy"),
				webworkerPolyfills
			});
		} catch (e) {
			actualThrows = true;
		}
		strictEqual(actualThrows, expectThrows);
	});
}

describe("assetFilename", () => {
	test_assetFilename("Valid: undefined", undefined, false);
	test_assetFilename('Valid: ""', "", false);
	test_assetFilename('Valid: "hello"', "hello", false);
	test_assetFilename("Invalid: 123", 123, true);
	test_assetFilename("Invalid: {}", {}, true);
	test_assetFilename("Invalid: NaN", NaN, true);
	test_assetFilename("Invalid: null", null, true);
	test_assetFilename("Invalid: false", false, true);
	test_assetFilename("Invalid: true", true, true);
	test_assetFilename("Invalid: Promise", Promise.resolve(), true);
	test_assetFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("copyExtensions", () => {
	test_copyExtensions("Valid: []", [], false);
	test_copyExtensions('Valid: ["dummy"]', ["dummy"], false);
	test_copyExtensions("Invalid: {}", {}, true);
	test_copyExtensions("Invalid: 123", 123, true);
	test_copyExtensions('Invalid: ""', "", true);
	test_copyExtensions('Invalid: "hello"', "hello", true);
	test_copyExtensions("Invalid: NaN", NaN, true);
	test_copyExtensions("Invalid: null", null, true);
	test_copyExtensions("Invalid: false", false, true);
	test_copyExtensions("Invalid: true", true, true);
	test_copyExtensions("Invalid: Symbol", Symbol("hello"), true);
});
describe("copyPatterns", () => {
	test_copyPatterns("Valid: []", [], false);
	test_copyPatterns("Valid: [{from: 'example/path'}]", [{from: "example/path"}], false);
	test_copyPatterns("Invalid: {}", {}, true);
	test_copyPatterns("Invalid: 123", 123, true);
	test_copyPatterns('Invalid: ""', "", true);
	test_copyPatterns('Invalid: "hello"', "hello", true);
	test_copyPatterns("Invalid: NaN", NaN, true);
	test_copyPatterns("Invalid: null", null, true);
	test_copyPatterns("Invalid: false", false, true);
	test_copyPatterns("Invalid: true", true, true);
	test_copyPatterns("Invalid: Symbol", Symbol("hello"), true);
});
describe("cssChunkFilename", () => {
	test_cssChunkFilename("Valid: undefined", undefined, false);
	test_cssChunkFilename('Valid: ""', "", false);
	test_cssChunkFilename('Valid: "hello"', "hello", false);
	test_cssChunkFilename("Invalid: 123", 123, true);
	test_cssChunkFilename("Invalid: {}", {}, true);
	test_cssChunkFilename("Invalid: NaN", NaN, true);
	test_cssChunkFilename("Invalid: null", null, true);
	test_cssChunkFilename("Invalid: false", false, true);
	test_cssChunkFilename("Invalid: true", true, true);
	test_cssChunkFilename("Invalid: Promise", Promise.resolve(), true);
	test_cssChunkFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("cssFilename", () => {
	test_cssFilename("Valid: undefined", undefined, false);
	test_cssFilename('Valid: ""', "", false);
	test_cssFilename('Valid: "hello"', "hello", false);
	test_cssFilename("Invalid: 123", 123, true);
	test_cssFilename("Invalid: {}", {}, true);
	test_cssFilename("Invalid: NaN", NaN, true);
	test_cssFilename("Invalid: null", null, true);
	test_cssFilename("Invalid: false", false, true);
	test_cssFilename("Invalid: true", true, true);
	test_cssFilename("Invalid: Promise", Promise.resolve(), true);
	test_cssFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("cssModules", () => {
	test_cssModules("Valid: true", true, false);
	test_cssModules("Valid: false", true, false);

	// It only checks for the data type, not the value inside
	test_cssModules("Valid: {}", {}, false);
	test_cssModules('Valid: ""', "", false);
	test_cssModules('Valid: "true"', "true", false);
	test_cssModules('Valid: "false"', "false", false);

	test_cssModules("Invalid: 123", 123, true);
	test_cssModules("Invalid: 0", 0, true);
	test_cssModules("Invalid: NaN", NaN, true);
	test_cssModules("Invalid: -1", -1, true);
	test_cssModules("Invalid: null", null, true);
	test_cssModules("Invalid: Symbol", Symbol("true"), true);
});
describe("embedExtensions", () => {
	test_embedExtensions("Valid: []", [], false);
	test_embedExtensions('Valid: ["dummy"]', ["dummy"], false);
	test_embedExtensions("Invalid: {}", {}, true);
	test_embedExtensions("Invalid: 123", 123, true);
	test_embedExtensions('Invalid: ""', "", true);
	test_embedExtensions('Invalid: "hello"', "hello", true);
	test_embedExtensions("Invalid: NaN", NaN, true);
	test_embedExtensions("Invalid: null", null, true);
	test_embedExtensions("Invalid: false", false, true);
	test_embedExtensions("Invalid: true", true, true);
	test_embedExtensions("Invalid: Symbol", Symbol("hello"), true);
});
describe("embedLimit", () => {
	test_embedLimit("Valid: 123", 123, false);
	test_embedLimit('Invalid: ""', "", true);
	test_embedLimit('Invalid: "hello"', "hello", true);
	test_embedLimit("Invalid: {}", {}, true);
	test_embedLimit("Invalid: NaN", NaN, true);
	test_embedLimit("Invalid: null", null, true);
	test_embedLimit("Invalid: false", false, true);
	test_embedLimit("Invalid: true", true, true);
	test_embedLimit("Invalid: Promise", Promise.resolve(), true);
	test_embedLimit("Invalid: Symbol", Symbol("hello"), true);
});
describe("entry", () => {
	test_entry("Valid: {}", {}, false);
	test_entry('Valid: {dummy: "./src/dummy.ts"}', {dummy: "./src/dummy.ts"}, false);
	test_entry("Invalid: NaN", NaN, true);
	test_entry("Invalid: 123", 123, true);
	test_entry('Invalid: ""', "", true);
	test_entry("Invalid: []", [], true);
	test_entry('Invalid: "hello"', "hello", true);
	test_entry("Invalid: null", null, true);
	test_entry("Invalid: false", false, true);
	test_entry("Invalid: true", true, true);
	test_entry("Invalid: RegExp", /hello/, true);
	test_entry("Invalid: Promise", Promise.resolve(), true);
	test_entry("Invalid: Symbol", Symbol("hello"), true);
});
describe("injectPatterns", () => {
	test_injectPatterns("Valid: []", [], false);
	test_injectPatterns('Valid: [{append: true, assets: "hello.js"}]', [{append: true, assets: "hello.js"}], false);
	test_injectPatterns("Invalid: {}", {}, true);
	test_injectPatterns("Invalid: 123", 123, true);
	test_injectPatterns('Invalid: ""', "", true);
	test_injectPatterns('Invalid: "hello"', "hello", true);
	test_injectPatterns("Invalid: NaN", NaN, true);
	test_injectPatterns("Invalid: null", null, true);
	test_injectPatterns("Invalid: false", false, true);
	test_injectPatterns("Invalid: true", true, true);
	test_injectPatterns("Invalid: Symbol", Symbol("hello"), true);
});
describe("jsChunkFilename", () => {
	test_jsChunkFilename("Valid: undefined", undefined, false);
	test_jsChunkFilename('Valid: ""', "", false);
	test_jsChunkFilename('Valid: "hello"', "hello", false);
	test_jsChunkFilename("Invalid: 123", 123, true);
	test_jsChunkFilename("Invalid: {}", {}, true);
	test_jsChunkFilename("Invalid: NaN", NaN, true);
	test_jsChunkFilename("Invalid: null", null, true);
	test_jsChunkFilename("Invalid: false", false, true);
	test_jsChunkFilename("Invalid: true", true, true);
	test_jsChunkFilename("Invalid: Promise", Promise.resolve(), true);
	test_jsChunkFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("jsFilename", () => {
	test_jsFilename("Valid: undefined", undefined, false);
	test_jsFilename('Valid: ""', "", false);
	test_jsFilename('Valid: "hello"', "hello", false);
	test_jsFilename("Invalid: 123", 123, true);
	test_jsFilename("Invalid: {}", {}, true);
	test_jsFilename("Invalid: NaN", NaN, true);
	test_jsFilename("Invalid: null", null, true);
	test_jsFilename("Invalid: false", false, true);
	test_jsFilename("Invalid: true", true, true);
	test_jsFilename("Invalid: Promise", Promise.resolve(), true);
	test_jsFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("mode", () => {
	test_mode('Valid: "production"', "hello", false);
	test_mode('Valid: "development"', "hello", false);
	test_mode('Valid: "hello"', "hello", false);
	test_mode('Invalid: ""', "", true);
	test_mode("Invalid: true", true, true);
	test_mode("Invalid: false", true, true);
	test_mode("Invalid: NaN", NaN, true);
	test_mode("Invalid: 123", 123, true);
	test_mode("Invalid: {}", {}, true);
	test_mode("Invalid: null", null, true);
	test_mode("Invalid: Promise", Promise.resolve(), true);
	test_mode("Invalid: Symbol", Symbol("hello"), true);
});
describe("outputFolder", () => {
	test_outputFolder("Valid: __dirname", join(__dirname, "dummy"), false);
	test_outputFolder('Valid: ""', "", false);
	test_outputFolder('Invalid: "myfolder"', "myfolder", true);
	test_outputFolder('Invalid: "./myfolder"', "./myfolder", true);
	test_outputFolder("Invalid: NaN", NaN, true);
	test_outputFolder("Invalid: 123", 123, true);
	test_outputFolder("Invalid: null", null, true);
	test_outputFolder("Invalid: false", false, true);
	test_outputFolder("Invalid: true", true, true);
	test_outputFolder("Invalid: {}", {}, true);
	test_outputFolder("Invalid: Promise", Promise.resolve(), true);
	test_outputFolder("Invalid: Symbol", Symbol("hello"), true);
});
describe("polyfills", () => {
	test_polyfills('Valid: ["./hello.js", "world"]', ["./hello.js", "world"], false);
	test_polyfills("Valid: []", [], false);
	test_polyfills('Invalid: "./hello.js"', "./hello.js", true);
	test_polyfills('Invalid: ""', "", true);
	test_polyfills("Invalid: {}", {}, true);
	test_polyfills("Invalid: 123", 123, true);
	test_polyfills('Invalid: "hello"', "hello", true);
	test_polyfills("Invalid: NaN", NaN, true);
	test_polyfills("Invalid: null", null, true);
	test_polyfills("Invalid: false", false, true);
	test_polyfills("Invalid: true", true, true);
	test_polyfills("Invalid: Symbol", Symbol("hello"), true);
});
describe("port", () => {
	test_port("Valid: 8080", 8080, false);
	test_port("Valid: 80", 80, false);
	test_port("Invalid: 0", 0, true);
	test_port("Invalid: -1", -1, true);
	test_port("Invalid: {}", {}, true);
	test_port("Invalid: NaN", NaN, true);
	test_port('Invalid: ""', "", true);
	test_port('Invalid: "hello"', "hello", true);
	test_port("Invalid: null", null, true);
	test_port("Invalid: false", false, true);
	test_port("Invalid: true", true, true);
	test_port("Invalid: Symbol", Symbol("hello"), true);
});
describe("publicPath", () => {
	test_publicPath('Valid: ""', "", false);
	test_publicPath('Valid: "hello"', "hello", false);
	test_publicPath("Invalid: 123", 123, true);
	test_publicPath("Invalid: {}", {}, true);
	test_publicPath("Invalid: NaN", NaN, true);
	test_publicPath("Invalid: null", null, true);
	test_publicPath("Invalid: false", false, true);
	test_publicPath("Invalid: true", true, true);
	test_publicPath("Invalid: Promise", Promise.resolve(), true);
	test_publicPath("Invalid: Symbol", Symbol("hello"), true);
});

describe("rawExtensions", () => {
	test_rawExtensions("Valid: []", [], false);
	test_rawExtensions('Valid: ["dummy"]', ["dummy"], false);
	test_rawExtensions("Invalid: {}", {}, true);
	test_rawExtensions("Invalid: 123", 123, true);
	test_rawExtensions('Invalid: ""', "", true);
	test_rawExtensions('Invalid: "hello"', "hello", true);
	test_rawExtensions("Invalid: NaN", NaN, true);
	test_rawExtensions("Invalid: null", null, true);
	test_rawExtensions("Invalid: false", false, true);
	test_rawExtensions("Invalid: true", true, true);
	test_rawExtensions("Invalid: Symbol", Symbol("hello"), true);
});
describe("rootFolder", () => {
	test_rootFolder("Valid: __dirname", __dirname, false);
	test_rootFolder('Valid: ""', "", false);
	test_rootFolder('Invalid: "myfolder"', "myfolder", true);
	test_rootFolder('Invalid: "./myfolder"', "./myfolder", true);
	test_rootFolder("Invalid: NaN", NaN, true);
	test_rootFolder("Invalid: 123", 123, true);
	test_rootFolder("Invalid: null", null, true);
	test_rootFolder("Invalid: false", false, true);
	test_rootFolder("Invalid: true", true, true);
	test_rootFolder("Invalid: {}", {}, true);
	test_rootFolder("Invalid: Promise", Promise.resolve(), true);
	test_rootFolder("Invalid: Symbol", Symbol("hello"), true);
});
describe("skipHashes", () => {
	test_skipHashes("Valid: true", true, false);
	test_skipHashes("Valid: false", true, false);
	test_skipHashes('Invalid: ""', "", true);
	test_skipHashes('Invalid: "true"', "true", true);
	test_skipHashes('Invalid: "false"', "false", true);
	test_skipHashes("Invalid: 123", 123, true);
	test_skipHashes("Invalid: 0", 0, true);
	test_skipHashes("Invalid: NaN", NaN, true);
	test_skipHashes("Invalid: -1", -1, true);
	test_skipHashes("Invalid: {}", {}, true);
	test_skipHashes("Invalid: null", null, true);
	test_skipHashes("Invalid: Symbol", Symbol("true"), true);
});
describe("skipPostprocess", () => {
	test_skipPostprocess("Valid: true (with outputFolder)", true, false, true);
	test_skipPostprocess("Valid: true (without outputFolder)", true, false, false);
	test_skipPostprocess("Valid: false (with outputFolder)", false, false, true);
	test_skipPostprocess("Valid: false (without outputFolder)", false, false, false);
	test_skipPostprocess('Invalid: ""', "", true);
	test_skipPostprocess('Invalid: "true"', "true", true);
	test_skipPostprocess('Invalid: "false"', "false", true);
	test_skipPostprocess("Invalid: 123", 123, true);
	test_skipPostprocess("Invalid: 0", 0, true);
	test_skipPostprocess("Invalid: NaN", NaN, true);
	test_skipPostprocess("Invalid: -1", -1, true);
	test_skipPostprocess("Invalid: {}", {}, true);
	test_skipPostprocess("Invalid: null", null, true);
	test_skipPostprocess("Invalid: Symbol", Symbol("true"), true);
});
describe("skipReset", () => {
	test_skipReset("Valid: true", true, false);
	test_skipReset("Valid: false", true, false);
	test_skipReset('Invalid: ""', "", true);
	test_skipReset('Invalid: "true"', "true", true);
	test_skipReset('Invalid: "false"', "false", true);
	test_skipReset("Invalid: 123", 123, true);
	test_skipReset("Invalid: 0", 0, true);
	test_skipReset("Invalid: NaN", NaN, true);
	test_skipReset("Invalid: -1", -1, true);
	test_skipReset("Invalid: {}", {}, true);
	test_skipReset("Invalid: null", null, true);
	test_skipReset("Invalid: Symbol", Symbol("true"), true);
});
describe("sourcemaps", () => {
	test_sourcemaps("Valid: true", true, false);
	test_sourcemaps("Valid: false", true, false);
	test_sourcemaps('Invalid: ""', "", true);
	test_sourcemaps('Invalid: "true"', "true", true);
	test_sourcemaps('Invalid: "false"', "false", true);
	test_sourcemaps("Invalid: 123", 123, true);
	test_sourcemaps("Invalid: 0", 0, true);
	test_sourcemaps("Invalid: NaN", NaN, true);
	test_sourcemaps("Invalid: -1", -1, true);
	test_sourcemaps("Invalid: {}", {}, true);
	test_sourcemaps("Invalid: null", null, true);
	test_sourcemaps("Invalid: Symbol", Symbol("true"), true);
});
describe("webworkerFilename", () => {
	test_webworkerFilename("Valid: undefined", undefined, false);
	test_webworkerFilename('Valid: ""', "", false);
	test_webworkerFilename('Valid: "hello"', "hello", false);
	test_webworkerFilename("Invalid: 123", 123, true);
	test_webworkerFilename("Invalid: {}", {}, true);
	test_webworkerFilename("Invalid: NaN", NaN, true);
	test_webworkerFilename("Invalid: null", null, true);
	test_webworkerFilename("Invalid: false", false, true);
	test_webworkerFilename("Invalid: true", true, true);
	test_webworkerFilename("Invalid: Promise", Promise.resolve(), true);
	test_webworkerFilename("Invalid: Symbol", Symbol("hello"), true);
});
describe("webworkerPattern", () => {
	test_webworkerPattern("Valid: /hello/", /hello/, false);
	test_webworkerPattern('Invalid: "/hello/"', "/hello/", true);
	test_webworkerPattern('Invalid: ""', "", true);
	test_webworkerPattern("Invalid: {}", {}, true);
	test_webworkerPattern("Invalid: 123", 123, true);
	test_webworkerPattern('Invalid: "hello"', "hello", true);
	test_webworkerPattern("Invalid: NaN", NaN, true);
	test_webworkerPattern("Invalid: null", null, true);
	test_webworkerPattern("Invalid: false", false, true);
	test_webworkerPattern("Invalid: true", true, true);
	test_webworkerPattern("Invalid: Symbol", Symbol("hello"), true);
});
describe("webworkerPolyfills", () => {
	test_webworkerPolyfills('Valid: ["./hello.js", "world"]', ["./hello.js", "world"], false);
	test_webworkerPolyfills("Valid: []", [], false);
	test_webworkerPolyfills('Invalid: "./hello.js"', "./hello.js", true);
	test_webworkerPolyfills('Invalid: ""', "", true);
	test_webworkerPolyfills("Invalid: {}", {}, true);
	test_webworkerPolyfills("Invalid: 123", 123, true);
	test_webworkerPolyfills('Invalid: "hello"', "hello", true);
	test_webworkerPolyfills("Invalid: NaN", NaN, true);
	test_webworkerPolyfills("Invalid: null", null, true);
	test_webworkerPolyfills("Invalid: false", false, true);
	test_webworkerPolyfills("Invalid: true", true, true);
	test_webworkerPolyfills("Invalid: Symbol", Symbol("hello"), true);
});

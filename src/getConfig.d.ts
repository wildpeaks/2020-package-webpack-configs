import {Configuration, Entry} from 'webpack';


type InjectTag = {
	path: string;
	type?: 'css' | 'js';
	attributes?: {[key: string]: string};

	glob?: string;
	globPath?: string;
	globFlatten?: string;

	publicPath?: boolean | (
		(path: string, publicPath: string) => string
	);
	external?: {
		variableName: string;
		packageName: string;
	};
} | string;

type GetConfigOptions = {

	/**
	 * Use `development` to **build faster** by skipping optimization and SRI hashes.
	 *
	 * Use `production` to **optimize the output** (CSS and JS files are minified) and make the HTML script tags
	 * have [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) hashes.
	 *
	 * @default "production"
	 * @see https://webpack.js.org/concepts/mode/
	 */
	mode?: string;

	/**
	 * List of **files to compile**.
	 *
	 * ````ts
	 * // Example
	 * {
	 * 	app1: './src/entry1.ts',
	 * 	app2: './src/entry2.ts',
	 * 	app3: './src/entry3.ts'
	 * }
	 * ````
	 *
	 * @see [Entry Points](https://webpack.js.org/concepts/entry-points/) in the Webpack documentation
	 */
	entry?: Entry;

	/**
	 * List of **HTML pages** to output.
	 *
	 * ````ts
	 * // Example: Single page
	 * {
	 * 	pages: [
	 * 		{
	 * 			title: 'Index',
	 * 			filename: 'index.html'
	 * 		}
	 * 	]
	 * }
	 *
	 * // Example: Multiple pages
	 * {
	 * 	entry: {
	 * 		app1: './src/first.ts',
	 * 		app2: './src/second.ts'
	 * 	},
	 * 	pages: [
	 * 		{
	 * 			title: 'First',
	 * 			filename: 'first-page.html',
	 * 			chunks: ['app1']
	 * 		},
	 * 		{
	 * 			title: 'Second',
	 * 			filename: 'second-page.html',
	 * 			chunks: ['app2']
	 * 		}
	 * 	]
	 * }
	 *
	 * // Example: Shared chunk
	 * {
	 * 	entry: {
	 * 		app1: './src/first.ts',
	 * 		app2: './src/second.ts',
	 * 		shared: './src/extras.ts'
	 * 	},
	 * 	pages: [
	 * 		{
	 * 			title: 'First',
	 * 			filename: 'first-page.html',
	 * 			chunks: ['shared', 'app1']
	 * 		},
	 * 		{
	 * 			title: 'Second',
	 * 			filename: 'second-page.html',
	 * 			chunks: ['shared', 'app2']
	 * 		}
	 * 	]
	 * }
	 * ````
	 *
	 * @default {title: 'Index', filename: "index.html"}
	 * @see [Options](https://github.com/jantimon/html-webpack-plugin#options) in the `html-webpack-plugin` documentation
	 */
	pages?: {
		title?: string;
		filename: string;

		favicon?: string;
		meta?: {
			[key: string]: string;
		};
		base?: string | false;

		template?: string;
		templateParameters?: any;

		chunks?: string[];
		chunksSortMode?: any;
		excludeChunks?: string[];

		cache?: boolean;
		inject?: boolean;
		showErrors?: boolean;
	}[];


	/**
	 * Custom **filename for JS** bundles.
	 *
	 * By default, files are named `[name].js` (development mode) or `[hash].[name].js` (production mode).
	 *
	 * For example, this generates `assets/scripts/app1.js`:
	 * ````json
	 * {
	 * 	"entry": {
	 * 		"app1": "./src/example.ts"
	 * 	},
	 * 	"jsFilename": "assets/scripts/[name].js"
	 * }
	 * ````
	 */
	jsFilename?: string;

	/**
	 * Custom **filename for JS chunks**.
	 *
	 * By default, files are named `chunk.[id].js` (development mode) or `[hash].chunk.[id].js` (production mode).
	 *
	 * For example, this generates `assets/scripts/chunk.0.js`:
	 * ````json
	 * {
	 * 	"jsChunkFilename": "assets/scripts/chunk.[id].js"
	 * }
	 * ````
	 */
	jsChunkFilename?: string;

	/**
	 * Custom **filename for Web Worker** bundles.
	 *
	 * By default, files are named `[name].js` (development mode) or `[hash].[name].js` (production mode).
	 *
	 * For example, this generates `assets/scripts/example.webworker.js` for file `example.webworker.js`:
	 * ````json
	 * {
	 * 	"webworkerFilename": "assets/scripts/[name].js"
	 * }
	 * ````
	 */
	webworkerFilename?: string;

	/**
	 * Custom **filename for CSS** bundles.
	 *
	 * By default, files are named `[name].css` (development mode) or `[hash].[name].css` (production mode).
	 *
	 * For example, this generates `assets/stylesheets/app1.css`:
	 * ````json
	 * {
	 * 	"entry": {
	 * 		"app1": "./src/example.ts"
	 * 	},
	 * 	"cssFilename": "assets/stylesheets/[name].css"
	 * }
	 * ````
	 */
	cssFilename?: string;

	/**
	 * Custom **filename for CSS chunks**.
	 *
	 * By default, files are named `chunk.[id].css` (development mode) or `[hash].chunk.[id].css` (production mode).
	 *
	 * For example, this generates `assets/stylesheets/chunk.0.js`:
	 * ````json
	 * {
	 * 	"cssChunkFilename": "assets/stylesheets/chunk.[id].js"
	 * }
	 * ````
	 */
	cssChunkFilename?: string;

	/**
	 * Custom **filename for assets** (images, json, etc..).
	 *
	 * By default, files are named `assets/[name].[ext]` (development mode) or `assets/[hash].[name].[ext]` (production mode).
	 *
	 * For example, this generates `files/asset.image.jpg` for file `image.jpg`:
	 * ````json
	 * {
	 * 	"assetFilename": "files/asset.[name].[ext]"
	 * }
	 * ````
	 */
	assetFilename?: string;

	/**
	 * **Absolute path to the root** folder context.
	 * Defaults to current working directory.
	 *
	 * Examples: `C:/Example` or `/usr/share/www/example`
	 *
	 * @see [context](https://webpack.js.org/configuration/entry-context/#context) in the Webpack documentation
	 */
	rootFolder?: string;

	/**
	 * **Absolute path to the output** folder, where files are emitted.
	 * Defaults to subfolder "dist" in `rootFolder`.
	 *
	 * Example: `C:/Example/dist` or `/usr/share/www/example/dist`
	 *
	 * @see [output.path](https://webpack.js.org/configuration/output/#output-path) in the Webpack documentation
	 */
	outputFolder?: string;

	/**
	 * Path **prepended to url** references.
	 *
	 * Example: `"/mysite/"`
	 *
	 * @default "/"
	 * @see [publicPath](https://webpack.js.org/guides/public-path/) in the Webpack documentation
	 */
	publicPath?: string;

	/**
	 * **Port number** for the Webpack Dev Server.
	 *
	 * So `port: 8000` means it runs at `http://localhost:8000`.
	 *
	 * @default 8000
	 * @see [devServer.port](https://webpack.js.org/configuration/dev-server/#devserver-port) in the Webpack documentation
	 */
	port?: number;

	/**
	 * The **CSS Modules** option turns classnames and identifiers globally unique at build time,
	 * and importing a stylesheet returns an object with the generated unique classnames.
	 *
	 * For example, two components could use a `.button` class.
	 * In regular CSS, this would conflict because one would overwrite the other.
	 * But this option renames both classes during the build, so they can co-exist.
	 *
	 * @default true
	 * @see [Modules](https://github.com/webpack-contrib/css-loader#modules) in the `css-loader` documentation
	 */
	cssModules?: boolean;

	/**
	 * Prepends arbitrary SCSS (or plain CSS) code to all `.css` and `.scss` files.
	 *
	 * Useful for defining globals or adding a framework:
	 *  - *SCSS Variables* for build-time variables
	 *  - *CSS Custom properties* for runtime variables
	 *
	 * Note: this is **prepended to every file**, so this is a good fit for theme variables.
	 * Use `polyfills` instead to add a CSS Reset (or `:root` CSS Variables) **once per Entry**.
	 *
	 * ````ts
	 * // Example: Define SCSS variables
	 * {
	 * 	scss: `
	 * 		$primary: rgb(0, 255, 0);
	 * 		$secondary: rgb(0, 128, 0);
	 * 	`
	 * }
	 *
	 * // Example: Import a SCSS stylesheet
	 * {
	 * 	scss: '@import "variables.scss";'
	 * }
	 *
	 * // Example: Imports a CSS reset and multiple stylesheets from a framework
	 * {
	 * 	polyfills: ['./src/reset.css'],
	 * 	scss: '@import "myframework/functions"; @import "myframework/variables";'
	 * }
	 * ````
	 *
	 * @default ""
	 * @see [SASS Variables](https://sass-lang.com/guide#topic-2)
	 * @see [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables)
	 */
	scss?: string;

	/**
	 * Filesize limit to **embed assets**.
	 *
	 * Beyond the limit, assets are considered external files
	 * (copied to the output folder and referenced by path).
	 *
	 * @default 5000
	 * @see [limit](https://github.com/webpack-contrib/url-loader#limit) in the `url-loader` documentation
	 */
	embedLimit?: number;

	/**
	 * File extensions of files to embed as base64 (when small enough)
	 * or just copy as-is (when too large), for files referenced
	 * by `import` or `require`.
	 *
	 * @default ["jpg", "png", "gif", "svg"]
	 */
	embedExtensions?: string[];

	/**
	 * File extensions of files to import as raw String,
	 * for files referenced by `import` or `require`.
	 *
	 * ````ts
	 * // Example
	 * {
	 * 	rawExtensions: ["txt", "html", "md"]
	 * }
	 * ````
	 *
	 * @default []
	 */
	rawExtensions?: string[];

	/**
	 * File extensions of files to just copy as-is,
	 * for files referenced by `import` or `require`.
	 *
	 * @default ["woff"]
	 */
	copyExtensions?: string [];

	/**
	 * Additional files & folders to copy as-is, despite not being referenced by `import` or `require`.
	 *
	 * ````ts
	 * // Copy a directory:
	 * // "models/example.ext" is copied to "assets/example.ext"
	 * {from: 'models', to: 'assets'}
	 *
	 * // Copy specific files:
	 * // "extras/models/example.gltf" is copied to "assets/extras/models/example.gltf"
	 * {from: 'extras/**'+'/*.gltf', to: 'assets'}
	 *
	 * // Copy specific files:
	 * // "extras/models/example.gltf" is copied to "assets/models/example.gltf"
	 * {from: '**'+'/*.gltf', to: 'assets', context: 'extras'}
	 *
	 * // Ignore some files
	 * {from: 'textures', to: 'assets', ignore: ['Thumbs.db']}
	 * ````
	 *
	 * @default []
	 * @see [patterns](https://github.com/webpack-contrib/copy-webpack-plugin#patterns) in the `copy-webpack-plugin` documentation
	 */
	copyPatterns?: string [];

	/**
	 * List of **pre-built scripts & stylesheets** to inject in HTML.
	 *
	 * Useful for large libraries (local or CDN), it **drastically speeds up the build**
	 * when they're not part of the build itself.
	 *
	 * You can use `copyPatterns` to copy arbitrary files to the output if the injected patterns
	 * use relative paths instead of urls.
	 *
	 * Note that the resulting script/link tags **don't have automatic Subresource Integrity hashes**,
	 * you should specify the hash manually using `attributes` (CDN hosts usually provide them along the urls).
	 *
	 * ````ts
	 * // Example: CDN urls and Subresource Integrity
	 * {
	 * 	append: false,
	 * 	publicPath: false,
	 * 	tags: [
	 * 		{
	 * 			type: 'css',
	 * 			path: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css',
	 * 			attributes: {
	 * 				crossorigin: 'anonymous',
	 * 				integrity: 'sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB'
	 * 			}
	 * 		},
	 * 		{
	 * 			type: 'js',
	 * 			path: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js',
	 * 			attributes: {
	 * 				crossorigin: 'anonymous',
	 * 				integrity: 'sha384-smHYKdLADwkXOn1EmN1qk/HfnUcbVRZyYmZ4qpPea6sjB/pTJ0euyQp0Mk8ck+5T'
	 * 			}
	 * 		}
	 * 	]
	 * }
	 *
	 * // Example: use `append: false` to add at the beginning
	 * {
	 * 	append: false,
	 * 	tags: ['thirdparty/three.min.js', 'thirdparty/OrbitControls.js']
	 * }
	 *
	 * // Example: use `append: true` to add at the end
	 * {
	 * 	append: true,
	 * 	tags: ['override-styles.min.css']
	 * }
	 * ````
	 *
	 * @default []
	 * @see [Options](https://www.npmjs.com/package/html-webpack-tags-plugin#options) in the `html-webpack-tags-plugin` documentation
	 */
	injectPatterns?: {
		append?: boolean;
		prependExternals?: boolean;
		publicPath?: boolean;
		tags?: InjectTag[];
		files?: string[];
		jsExtensions?: string | string[];
		cssExtensions?: string | string[];
		usePublicPath?: boolean;
		hash?: string;
		useHash?: boolean;
		addHash?: (
			(assetPath: String, hash: String) => string
		);

		// Too redundant with "tags"
		// links: any;
		// scripts: any;
	}[];

	/**
	 * **Sourcemaps** for scripts & stylesheets.
	 *
	 * @default true
	 * @see https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
	 */
	sourcemaps?: boolean;

	/**
	 * List of modules or files to automatically prepend to every entry.
	 * They are resolved from `rootFolder`.
	 *
	 * Note: given this accepts any extensions the loaders to,
	 * this can can also be used to prepend a **CSS Reset**.
	 *
	 * ````ts
	 * // Example: ES6 Promise polyfill & a CSS Reset
	 * {
	 * 	polyfills: [
	 * 		'core-js/stable/promise',
	 * 		'./src/reset.css'
	 * 	]
	 * }
	 * ````
	 *
	 * @default ['core-js/stable/promise']
	 */
	polyfills?: string[];

	/**
	 * List of modules or files to automatically prepend to every webworker.
	 *
	 * If you're using relative filepaths for polyfills instead of
	 * thirdparty modules or local modules, note that `webworkerPolyfills` references
	 * are resolved from each webworker unlike `polyfills` (because `worker-loader` doesn't have
	 * an option to have an array for its internal compilation, unlike main "entry" points,
	 * so the `webworkerPolyfills` references are imported directly in the code).
	 *
	 * @default ['core-js/stable/promise']
	 */
	webworkerPolyfills: string[];

	/**
	 * RegExp test for the Web Worker loader.
	 *
	 * @default /\.webworker\.ts$/
	 */
	webworkerPattern?: RegExp;

	/**
	 * Skip prost-processing:
	 * - `true` for the lightweight config (for tests)
	 * - `false` for the whole config
	 *
	 * @default false
	 */
	skipPostprocess?: boolean;

	/**
	 * If `true`, mode "production" won't add SRI hashes to `<script>` and `<link>` tags,
	 * and filenames will not contain a cache-busting hash.
	 *
	 * @default false
	 */
	skipHashes: boolean;

	/**
	 * If `true`, it will not empty the output folder at the start.
	 * This is useful if you have multiple configs at the same time
	 * and are emptying the output folder before starting Webpack.
	 *
	 * @default false
	 */
	skipReset: boolean;
};


/**
 * Generates a Webpack 4 config for Typescript webapps.
 */
declare function getConfig(options: GetConfigOptions): Configuration;
export = getConfig;

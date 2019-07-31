# Webpack Config: Web

[![Greenkeeper badge](https://badges.greenkeeper.io/wildpeaks/package-webpack-config-web.svg)](https://greenkeeper.io/)

Generates a **Webpack 4 config** for Web applications written in *Typescript*.


-------------------------------------------------------------------------------

## Example

package.json:
````js
"scripts": {

	// Build for production mode
	"build": "webpack --mode production",

	// Development server mode
	"watch": "webpack-dev-server --mode development"
},
"dependencies": {

	// This package
	"@wildpeaks/webpack-config-web": "...",

	// Peer dependencies
	"typescript": "...",
	"webpack": "...",
	"webpack-cli": "...",
	"webpack-dev-server": "...",

	// Application-specific dependencies
	"unfetch": "..."
}

````

webpack.config.js:
````js
'use strict';
const {join} = require('path');
const getConfig = require('@wildpeaks/webpack-config-web');

module.exports = function(_env, {mode = 'production'} = {}) {
	return getConfig({
		mode,
		entry: {
			myapp: './src/myapp.ts'
		},
		rootFolder: __dirname,
		outputFolder: join(__dirname, 'dist'),
		polyfills: [
			'core-js/stable/promise',
			'unfetch'
		]
	});
};
````


-------------------------------------------------------------------------------

## Options


---
### `mode`: String

Default: `production`.

Use `production` to optimize the output (CSS and JS files are minified), and the HTML script tags
have [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) hashes.

See [Mode](https://webpack.js.org/concepts/mode/) in the Webpack documentation.


---
### `entry`: Object

Webpack entries.

Default: `{}`

Example:

	{
		app1: './src/entry1.ts',
		app2: './src/entry2.ts',
		app3: './src/entry3.ts'
	}

See [Entry Points](https://webpack.js.org/concepts/entry-points/) in the Webpack documentation.


---
### `pages`: Object[]

List of **HTML pages** to generate.

Default: `{title: 'Index', filename: "index.html"}`.

When you have multiple pages, specify the `chunks` (id of the entries) to use in the page,
otherwise it will use all entries in the page.

Examples:
````js
// Single page
{
	pages: [
		{
			title: 'Index',
			filename: 'index.html'
		}
	]
}

// Multiple pages
{
	entry: {
		app1: './src/first.ts',
		app2: './src/second.ts'
	},
	pages: [
		{
			title: 'First',
			filename: 'first-page.html',
			chunks: ['app1']
		},
		{
			title: 'Second',
			filename: 'second-page.html',
			chunks: ['app2']
		}
	]
}

// Shared chunk
{
	entry: {
		app1: './src/first.ts',
		app2: './src/second.ts',
		shared: './src/extras.ts'
	},
	pages: [
		{
			title: 'First',
			filename: 'first-page.html',
			chunks: ['shared', 'app1']
		},
		{
			title: 'Second',
			filename: 'second-page.html',
			chunks: ['shared', 'app2']
		}
	]
}
````

See [Options](https://github.com/jantimon/html-webpack-plugin#options) in the `html-webpack-plugin` documentation.


---
### `jsFilename`: String

Custom **filename for JS** bundles.

By default, files are named `[name].js` (development mode) or `[hash].[name].js` (production mode).

For example, this generates `assets/scripts/app1.js`:
````json
{
	"entry": {
		"app1": "./src/example.ts"
	},
	"jsFilename": "assets/scripts/[name].js"
}
````

---
### `jsChunkFilename`: String

Custom **filename for JS chunks**.

By default, files are named `chunk.[id].js` (development mode) or `[hash].chunk.[id].js` (production mode).

For example, this generates `assets/scripts/chunk.0.js`:
````json
{
	"jsChunkFilename": "assets/scripts/chunk.[id].js"
}
````


---
### `webworkerFilename`: String

Custom **filename for Web Worker** bundles.

By default, files are named `[name].js` (development mode) or `[hash].[name].js` (production mode).

For example, this generates `assets/scripts/example.webworker.js` for file `example.webworker.js`:
````json
{
	"webworkerFilename": "assets/scripts/[name].js"
}
````


---
### `cssFilename`: String

Custom **filename for CSS** bundles.

By default, files are named `[name].css` (development mode) or `[hash].[name].css` (production mode).

For example, this generates `assets/stylesheets/app1.css`:
````json
{
	"entry": {
		"app1": "./src/example.ts"
	},
	"cssFilename": "assets/stylesheets/[name].css"
}
````

---
### `cssChunkFilename`: String

Custom **filename for CSS chunks**.

By default, files are named `chunk.[id].css` (development mode) or `[hash].chunk.[id].css` (production mode).

For example, this generates `assets/stylesheets/chunk.0.js`:
````json
{
	"cssChunkFilename": "assets/stylesheets/chunk.[id].js"
}
````


---
### `assetFilename`: String

Custom **filename for assets** (images, json, etc..).

By default, files are named `assets/[name].[ext]` (development mode) or `assets/[hash].[name].[ext]` (production mode).

For example, this generates `files/asset.image.jpg` for file `image.jpg`:
````json
{
	"assetFilename": "files/asset.[name].[ext]"
}
````


---
### `rootFolder`: String

**Absolute path to the root** folder context.
Defaults to the process current working directory.

Examples: `"C:/Example"` or `/usr/share/www/example`

See [context](https://webpack.js.org/configuration/entry-context/#context) in the Webpack documentation.

---
### `outputFolder`: String

**Absolute path to the output** folder, where files are emitted.

Defaults to subfolder `dist` in `rootFolder`.

Example: `"C:/Example/dist"` or `/usr/share/www/example/dist`

See [output.path](https://webpack.js.org/configuration/output/#output-path) in the Webpack documentation.


---
### `publicPath`: String

Path prepended to url references.

Default: `"/"`

Example: `"/mysite/"`

See [publicPath](https://webpack.js.org/guides/public-path/) in the Webpack documentation.


---
### `port`: Number

**Port number** for the Webpack Dev Server.

So `port: 8000` means it runs at `http://localhost:8000`.

Default: `8000`.

See [devServer.port](https://webpack.js.org/configuration/dev-server/#devserver-port) in the Webpack documentation.


---
### `cssModules`: Boolean

The **CSS Modules** option makes classnames and identifiers globally unique at build time,
and importing a stylesheet returns an object with the generated unique classnames.

For example, two components could use a `.button` class.
In regular CSS, this would conflict because one would overwrite the other.
But this option renames both classes during the build, so they can co-exist.

Default: `true`.

See [Modules](https://github.com/webpack-contrib/css-loader#modules) in the `css-loader` documentation.


### `scss`: String

Prepends arbitrary SCSS (or plain CSS) code to all `.css` and `.scss` files.

Useful for defining globals or adding a framework:
 - *SCSS Variables* for build-time variables
 - *CSS Custom properties* for runtime variables

Note: this is **prepended to every file**, so this is a good fit for theme variables.
Use `polyfills` instead to add a CSS Reset (or `:root` CSS Variables) **once per Entry**.

Default: `""`.

Examples:
```js
// Define SASS variables
{
	scss: `
		$primary: rgb(0, 255, 0);
		$secondary: rgb(0, 128, 0);
	`
}
```

```js
// Import a SASS stylesheet
{
	scss: '@import "variables.scss";'
}
```

```js
// Imports a CSS reset and multiple stylesheets from a framework
{
	polyfills: [
		'./src/reset.css'
	],
	scss: `
		@import "myframework/functions";
		@import "myframework/variables";
	`
}
```

See [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) in MDN
and [SASS Variables](https://sass-lang.com/guide#topic-2) in SASS documentation.


---
### `embedLimit`: number

Filesize limit to **embed assets**.

Beyond the limit, assets are considered external files
(copied to the output folder and referenced by path).

Default: `5000`.

See [limit](https://github.com/webpack-contrib/url-loader#limit) in the `url-loader` documentation.


---
### `embedExtensions`: String[]

File extensions of files to embed as base64 (when small enough)
or just copy as-is (when too large), for files referenced
by `import` or `require`.

Default: `["jpg", "png", "gif", "svg"]`.


---
### `rawExtensions`: String[]

File extensions of files to import as raw String, for files referenced by `import` or `require`.

Default: `[]`.

Example: `["txt", "html", "md"]`.


---
### `copyExtensions`: String[]

File extensions of files to just copy as-is, for files referenced by `import` or `require`.

Default: `["woff"]`.


---
### `copyPatterns`: Object[]

Additional files & folders to copy as-is, despite not being referenced by `import` or `require`.

Default: `[]`.

Examples:
````js
// Copy a directory:
// "models/example.ext" is copied to "assets/example.ext"
{from: 'models', to: 'assets'}

// Copy specific files:
// "extras/models/example.gltf" is copied to "assets/extras/models/example.gltf"
{from: 'extras/**/*.gltf', to: 'assets'}

// Copy specific files:
// "extras/models/example.gltf" is copied to "assets/models/example.gltf"
{from: '**/*.gltf', to: 'assets', context: 'extras'}

// Ignore some files
{from: 'textures', to: 'assets', ignore: ['Thumbs.db']}
````

See [patterns](https://github.com/webpack-contrib/copy-webpack-plugin#patterns) in the `copy-webpack-plugin` documentation.


---

### `injectPatterns`: Object[]

List of **pre-built scripts & stylesheets** to inject in HTML.

Useful for large libraries (local or CDN), it **drastically speeds up the build**
when they're not part of the build itself.

You can use `copyPatterns` to copy arbitrary files to the output if the injected patterns
use relative paths instead of urls.

Note that the resulting script/link tags **don't have automatic Subresource Integrity hashes**,
you should specify the hash manually using `attributes` (CDN hosts usually provide them along the urls).

Default: `[]`

Examples:
````js
// CDN urls and Subresource Integrity
{
	append: false,
	publicPath: false,
	tags: [
		{
			type: 'css',
			path: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css',
			attributes: {
				crossorigin: 'anonymous',
				integrity: 'sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB'
			}
		},
		{
			type: 'js',
			path: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js',
			attributes: {
				crossorigin: 'anonymous',
				integrity: 'sha384-smHYKdLADwkXOn1EmN1qk/HfnUcbVRZyYmZ4qpPea6sjB/pTJ0euyQp0Mk8ck+5T'
			}
		}
	]
}

// `append: false` to add at the beginning
{
	append: false,
	tags: ['thirdparty/three.min.js', 'thirdparty/OrbitControls.js']
}

// `append: true` to add at the end
{
	append: true,
	tags: ['override-styles.min.css']
}
````

See [Options](https://www.npmjs.com/package/html-webpack-tags-plugin#options) in the `html-webpack-tags-plugin` documentation.


---
### `sourcemaps`: Boolean

Use `true` to **generate sourcemaps** for scripts & stylesheets, `false` to skip them.

Default: `true`


---
### `polyfills`: String[]

List of modules or files to automatically prepend to every entry.
They are resolved from `rootFolder`.

Default: `['core-js/stable/promise']`

Note: given this accepts any extensions the loaders to,
this can can also be used to prepend a **CSS Reset**.

````ts
// Example: ES6 Promise polyfill & a CSS Reset
{
	polyfills: [
		'core-js/stable/promise',
		'./src/reset.css'
	]
}
````


---
### `webworkerPolyfills`: String[]

List of modules or files to automatically prepend to every webworker.

If you're using relative filepaths for polyfills instead of
thirdparty modules or local modules, note that `webworkerPolyfills` references
are resolved from each webworker unlike `polyfills` (because `worker-loader` doesn't have
an option to have an array for its internal compilation, unlike main "entry" points,
so the `webworkerPolyfills` references are imported directly in the code).

Default: `['core-js/stable/promise']`


---
### `webworkerPattern`: RegExp

RegExp test for the Web Worker loader.

Default: `/\.webworker\.ts$/`


---
### `skipPostprocess`: Boolean

Use `true` for the lightweight config (for tests), `false` for the whole config.

Default: `false`


---
### `skipHashes`: Boolean

If `true`, mode "production" won't add SRI hashes to `<script>` and `<link>` tags,
and filenames will not contain a cache-busting hash.

Default: `false`


---
### `skipReset`: Boolean

If `true`, it will not empty the output folder at the start.
This is useful if you have multiple configs at the same time and are emptying the output folder before starting Webpack.

Default: `false`.


-------------------------------------------------------------------------------

## Import CSS / SCSS / Images

By default, Typescript doesn't know what importing CSS or images return.

This is not needed for building the bundles, but VSCode wouldn't have proper autocompletion.
Therefore you should add generic type definitions (for example in `/src/index.d.ts`):

````ts
// CSS Modules Loader
declare module '*.css' {
	const _: {
		[key: string]: string;
	};
	export = _;
}
declare module '*.scss' {
	const _: {
		[key: string]: string;
	};
	export = _;
}

// URL Loader
declare module '*.jpg' {
	const _: string;
	export = _;
}
declare module '*.png' {
	const _: string;
	export = _;
}
````

This is already enough, but you can go even further with CSS Modules by typecasting it after import:

````ts
// "styles.css" contains classes `mybutton` and `mycontainer`
import * as rawCSS from './styles.css';

// Typecast to specify which properties exist
const typedCSS = rawCSS as {
	mybutton: string;
	mycontainer: string;
};

console.log( rawCSS.fake );        // the error is not detected
console.log( typedCSS.fake );      // the error is detected
````


-------------------------------------------------------------------------------

## CSS Autoprefixer

The property `browsers` has been removed in v3.0.0,
but PostCSS can still autoprefix based on a browsers list.

Your project should either contain a `.browserslistrc` file, for example:

````
>0.25%
ie >= 11
````

or a `browserlist` section in your `package.json`, for example:

````json
"browserslist": [
  ">0.25%",
  "ie >= 11"
]
````

More information at [Browserslist](https://github.com/browserslist/browserslist#readme).


-------------------------------------------------------------------------------

## Babel

Note that it **intentionally doesn't use Babel** because Typescript itself can already take care of transpiling
to ES5 + ES Modules, and Webpack converts the ES Modules. This greatly **reduces the number of dependencies**
and avoids [limitations of the Typescript plugin for Babel](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-typescript/README.md#babelplugin-transform-typescript).

However it also means it doesn't automatically include `core-js` dependencies.
Therefore **you can pass a list of polyfills** to use (*including polyfills that Babel wouldn't include*
and that you would have to add manually anyway) in options.


-------------------------------------------------------------------------------


# Webpack Config: Node

Generates a **Webpack 4 config** for Node applications written in *Typescript*.


-------------------------------------------------------------------------------

## Example

package.json:
````js
"scripts": {

	// Build for production mode
	"build": "webpack --mode production"

},
"dependencies": {

	// This package
	"@wildpeaks/webpack-config-node": "...",

	// Peer dependencies
	"typescript": "...",
	"webpack": "...",
	"webpack-cli": "..."
}
````

webpack.config.js:
````js
'use strict';
const {join} = require('path');
const getConfig = require('@wildpeaks/webpack-config-node');

module.exports = function(_env, {mode = 'production'} = {}) {
	return getConfig({
		mode,
		entry: {
			myapp: './src/myapp.ts'
		},
		rootFolder: __dirname,
		outputFolder: join(__dirname, 'dist')
	});
};
````


-------------------------------------------------------------------------------

## Options


---
### `mode`: String

Default: `production`.

Use `production` to optimize the output (JS files are minified).

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
### `sourcemaps`: Boolean

Use `true` to **generate sourcemaps** for scripts, `false` to skip them.

Default: `true`


---
### `skipHashes`: Boolean

If `true`, mode "production" won't add hashes in filenames.

Default: `false`


---
### `skipReset`: Boolean

If `true`, it will not empty the output folder at the start.
This is useful if you have multiple configs at the same time and are emptying the output folder before starting Webpack.

Default: `false`.


-------------------------------------------------------------------------------

## Exclude specific modules

Target `node` already excludes native modules like `fs` from the bundles,
meaning the output script will contain `require("fs")` calls.

You can exclude additional modules using [externals](https://webpack.js.org/configuration/externals/):

````js
'use strict';
const {join} = require('path');
const getConfig = require('@wildpeaks/webpack-config-node');

module.exports = function(_env, {mode = 'production'} = {}) {
	const config = getConfig({
		mode,
		entry: {
			myapp: './src/myapp.ts'
		},
		rootFolder: __dirname,
		outputFolder: join(__dirname, 'dist')
	});

	// This generates `require("mymodule")` in the output
	// instead of copying the source of mymodule in the bundle.
	config.externals = {
		mymodule: "commonjs mymodule"
	};

	return config;
};
````

You could also use package [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals)
to exclude the entire `node_modules` folder, but it's best to bundle as much of the dependencies
as possible to optimize for runtime.


-------------------------------------------------------------------------------

## Babel

Note that it **intentionally doesn't use Babel** because Typescript itself can already take care of transpiling
to ES2017 + ES Modules, and Webpack converts the ES Modules. This greatly **reduces the number of dependencies**
and avoids [limitations of the Typescript plugin for Babel](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-typescript/README.md#babelplugin-transform-typescript).


-------------------------------------------------------------------------------


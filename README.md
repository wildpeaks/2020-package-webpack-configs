# Webpack Config: Web

[![Greenkeeper badge](https://badges.greenkeeper.io/wildpeaks/package-webpack-config-web.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/wildpeaks/package-webpack-config-web.svg?branch=master)](https://travis-ci.org/wildpeaks/package-webpack-config-web)

Generates a **Webpack config** for Web applications written in *Typescript*.

Install:

	npm install @wildpeaks/webpack-config-web --save

-------------------------------------------------------------------------------

## Parameters

	@property {Object} entry Webpack entries
	@property {String} rootFolder Absolute path to the rroot context folder
	@property {String} outputFolder Absolute path to the folder where files are emitted
	@property {String} publicPath Relative path prepended to urls, e.g. `/` or `/mysite/`
	@property {Boolean} minify `true` to minify CSS/JS and use SRI hashes, `false` otherwise
	@property {Number} port Port for Webpack Dev Server
	@property {Object} cssVariables CSS Variables, e.g. `{themeBackground: 'rebeccapurple'}`
	@property {String[]} browsers Target browsers for CSS Autoprefixer
	@property {String[]} embedLimit Filesize limit to embed assets
	@property {String[]} embedExtensions File extensions of files to embed as base64 (if small enough) or just copy as-is (if large)
	@property {String[]} copyExtensions File extensions of files to just copy as-is
	@property {String} assetsRelativePath File extensions of files to just copy as-is


-------------------------------------------------------------------------------


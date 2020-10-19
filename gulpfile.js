/**
 * Settings
 * Turn on/off build features
 */

var settings = {
	clean: true,
	styles: true,
	svgs: true,
	copy: true,
	reload: true
};


/**
 * Paths to project folders
 */

var paths = {
	input: 'src/',
	output: 'dist/',
	styles: {
		input: 'src/sass/**/*.{scss,sass}',
		output: 'dist/css/'
	},
	svgs: {
		input: 'src/svg/*.svg',
		output: 'dist/svg/'
	},
	copyHtml: {
		input: 'src/**/*.html',
		output: 'dist/'
	},
    copyImages: {
		input: 'src/img/**/*',
		output: 'dist/img/'
	},
	reload: './dist/'
};

/**
 * Gulp Packages
 */

// General
var { src, dest, watch, series, parallel } = require('gulp');
var del = require('del');
var rename = require('gulp-rename');

// Styles
var Fiber = require('fibers');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var prefix = require('autoprefixer');
var minify = require('cssnano');
var cssMQPacker = require("@hail2u/css-mqpacker")
sass.compiler = require('sass');

// SVGs
var svgmin = require('gulp-svgmin');

// BrowserSync
var browserSync = require('browser-sync');


/**
 * Gulp Tasks
 */

// Remove pre-existing content from output folders
var cleanDist = function (done) {

	// Make sure this feature is activated before running
	if (!settings.clean) return done();

	// Clean the dist folder
	del.sync([
		paths.output
	]);

	// Signal completion
	return done();

};

// Process, lint, and minify Sass files
var buildStyles = function (done) {

	// Make sure this feature is activated before running
	if (!settings.styles) return done();

	// Run tasks on all Sass files
	return src(paths.styles.input)
		.pipe(sass({
            fiber: Fiber,
			outputStyle: 'expanded',
			sourceComments: true
		}))
		.pipe(postcss([
			prefix({
				cascade: true,
				remove: true
			}),
            cssMQPacker()
		]))
		.pipe(dest(paths.styles.output))
		.pipe(rename({suffix: '.min'}))
		.pipe(postcss([
			minify({
				discardComments: {
					removeAll: true
				}
			})
		]))
		.pipe(dest(paths.styles.output));

};

// Optimize SVG files
var buildSVGs = function (done) {

	// Make sure this feature is activated before running
	if (!settings.svgs) return done();

	// Optimize SVG files
	return src(paths.svgs.input)
		.pipe(svgmin())
		.pipe(dest(paths.svgs.output));

};

// Copy static files into output folder
var copyFiles = function (done) {

	// Make sure this feature is activated before running
	if (!settings.copy) return done();

	// Copy html
	src(paths.copyHtml.input)
		.pipe(dest(paths.copyHtml.output));

    // Copy images
    return src(paths.copyImages.input)
		.pipe(dest(paths.copyImages.output));

};

// Watch for changes to the src directory
var startServer = function (done) {

	// Make sure this feature is activated before running
	if (!settings.reload) return done();

	// Initialize BrowserSync
	browserSync.init({
		server: {
			baseDir: paths.reload
		}
	});

	// Signal completion
	done();

};

// Reload the browser when files change
var reloadBrowser = function (done) {
	if (!settings.reload) return done();
	browserSync.reload();
	done();
};

// Watch for changes
var watchSource = function (done) {
	watch(paths.input, series(exports.default, reloadBrowser));
	done();
};


/**
 * Export Tasks
 */

// Default task
// gulp
exports.default = series(
	cleanDist,
	parallel(
		buildStyles,
		buildSVGs,
		copyFiles
	)
);

// Watch and reload
// gulp watch
exports.watch = series(
	exports.default,
	startServer,
	watchSource
);

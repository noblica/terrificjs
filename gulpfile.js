var gulp = require('gulp'),
	path = require('path'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify'),
	watch = require('gulp-watch'),
	uglify = require('gulp-uglify'),
	plumber = require('gulp-plumber'),
	jshint = require('gulp-jshint'),
	jscs = require('gulp-jscs'),
	yuidoc = require("gulp-yuidoc"),
	sync = require('gulp-config-sync'),
	template = require('gulp-template'),
	size = require('gulp-size'),
	umd = require('gulp-umd'),
	umdconf = {
		exports: function (file) {
			return 'T';
		},
		namespace: function (file) {
			return 'T';
		}
	},
	del = require('del'),
	karma = require('karma').Server,
	fs = require('fs'),
	pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')),
	name = pkg.name,
	files = [
		'./src/Application.js',
		'./src/Sandbox.js',
		'./src/Module.js',
		'./src/EventEmitter.js',
		'./src/Utils.js',
		'./src/exports.js'
	];

// Remove the built files
gulp.task('clean', function (cb) {
	del(['./dist'], cb);
});

// Send a notification when JSHint fails,
// so that you know your changes didn't build
function jshintNotify(file) {
	if (!file.jshint) {
		return;
	}
	return file.jshint.success ? false : 'JSHint failed';
}

function jscsNotify(file) {
	if (!file.jscs) {
		return;
	}
	return file.jscs.success ? false : 'JSRC failed';
}

// Lint our source code
gulp.task('lint-src', function () {
	return gulp.src(['src/*.js'])
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(notify(jshintNotify))
		.pipe(jscs())
		.pipe(notify(jscsNotify))
		.pipe(jshint.reporter('fail'));
});

// Lint our test code
gulp.task('lint-test', function () {
	return gulp.src(['spec/*.js'])
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(notify(jshintNotify))
		.pipe(jscs())
		.pipe(notify(jscsNotify))
		.pipe(jshint.reporter('fail'));
});

gulp.task('build', ['lint-src', 'clean'], function () {
	return gulp.src(files)
		.pipe(plumber())
		.pipe(concat(name + '.js'))
		.pipe(template({version: pkg.version, year : new Date().getFullYear()}))
		.pipe(umd(umdconf))
		.pipe(size())
		.pipe(size({ gzip: true }))
		.pipe(gulp.dest('./dist'));
});

gulp.task('typescriptDefinition', ['clean'], function(){
	return gulp.src(['src/*.d.ts'])
		.pipe(plumber())
		.pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['build', 'typescriptDefinition'], function () {
	return gulp.src(path.join('./dist/', name + '.js'))
		.pipe(plumber())
		.pipe(sourcemaps.init({ debug: true }))
		.pipe(concat(name + '.min.js'))
		.pipe(uglify({preserveComments: 'some'}))
		.pipe(size())
		.pipe(size({ gzip: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('doc', ['build'], function () {
	return gulp
		.src(path.join('./dist', name + '.js'))
		.pipe(plumber())
		.pipe(yuidoc())
		.pipe(gulp.dest('./dist/docs'));
});

gulp.task('sync', function () {
	gulp.src(['bower.json'])
		.pipe(plumber())
		.pipe(sync())
		.pipe(gulp.dest('.'));
});

gulp.task('test', ['minify', 'lint-test'], function (done) {
	new karma({
		configFile: path.join(__dirname, 'karma.conf.js'),
		singleRun: true,
		autoWatch: false
	}, done).start();
});

gulp.task('watch', ['build'], function () {
	gulp.watch(files, ['build']);
});

gulp.task('default', ['minify', 'test', 'doc', 'sync'], function () {
});
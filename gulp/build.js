'use strict';

var gulp = require("gulp");
var concat = require('gulp-concat');
var sequence = require('run-sequence');
var debug = require('gulp-debug');
var uglify = require('gulp-uglifyjs');
var path = require('path');
var gulpCC = require("gulp-closurecompiler");
var jsdoc = require("gulp-jsdoc");
var shell = require('gulp-shell');
var header = require('gulp-header');

var paths = gulp.config.paths;

gulp.task('minify', function (cb) {
  var libs = paths.libs;

  // Need one run to strip @license
  return gulp.src(paths.libs)
      .pipe(debug())
      .pipe(gulpCC(
        {  fileName: 'libs.js' },
        { compilation_level: "WHITESPACE_ONLY" }
        ))
      .pipe(gulp.dest(paths.dist));
});

gulp.task('obfuscate',function (cb) {

  var minifySources = [paths.libsDistFile].concat(paths.sources);

  var pipeline =
    gulp.src(minifySources)
      .pipe(debug())
      .pipe(gulpCC({
        fileName: 'streamdataio.min.js' },
        {
          compilation_level: "ADVANCED_OPTIMIZATIONS",
          externs: 'gulp/externs/custom.js',
          create_source_map: path.join(paths.dist, 'streamdataio.min.js.map')
        }
        ))
      .pipe(gulp.dest(paths.dist))
    ;

  return pipeline;
});


gulp.task('buildScript', function (cb) {
  var sources = libsAndSources();
  var pkg = require('../package.json');
    var licenseText = pkg.licenseText.join("\n");


    var banner = ['/**',
        ' * Copyrights <%= pkg.copyrights %> - <%= pkg.author %>',
        ' *',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' *',
        ' * @license <%= pkg.license %>',
        ' *',
        '<%= licenseText %>',
        ' */',
        ''].join('\n');

  var pipeline =
    gulp.src(sources)
      .pipe(debug())
      .pipe(concat('streamdataio.js'))
      .pipe(header(banner, { pkg : pkg, licenseText : licenseText } ))
      .pipe(gulp.dest(paths.dist))
    ;
    return pipeline;

});

gulp.task('doc', function (cb) {

    var template = {
                       path            : "gulp/jsdoc-template",
                       systemName      : "Streamdata.io",
                       footer          : "",
                       copyright        : "Connect to <a href=\"http://streamdata.io/\" target=\"_blank\">streamdata.io</a> - @Copyright Motwin 2015",
                       navType         : "vertical",
                       theme           : "streamdataio",
                       linenums        : true,
                       collapseSymbols : false,
                       inverseNav      : true
                     };

    var pipeline =
        gulp.src(["./src/api.js", "./README.md"])
        .pipe(debug())
          .pipe(jsdoc.parser())
          .pipe(jsdoc.generator(paths.doc, template));
          
    return pipeline;

});


gulp.task('build', function(callback) {
   sequence('clean', 'buildScript', 'minify', 'obfuscate', 'doc', callback);
});

gulp.task('buildDev', ['watch', 'build'], function() {

});

function libsAndSources() {
  return paths.libs.concat(paths.sources);
};
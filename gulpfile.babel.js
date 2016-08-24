/*!
 * FireShell Gruntfile
 * http://getfireshell.com
 * @author Todd Motto
 */

'use strict';

/** globals */
import gulp from 'gulp';
import os from 'os';
import pkg from './package.json';

/** plug-ins */
import autoprefixer from 'gulp-autoprefixer';
import browserSync  from 'browser-sync';
import bower        from 'gulp-bower';
import clean        from 'gulp-clean';
import concat       from 'gulp-concat';
import cssmin       from 'gulp-cssmin';
import header       from 'gulp-header';
import jshint       from 'gulp-jshint';
import open         from 'gulp-open';
import plumber      from 'gulp-plumber';
import sass         from 'gulp-sass';
import uglify       from 'gulp-uglify';

/** dependencies */
import pump from 'pump';
import rename from 'gulp-rename';

/*========================================================
=            Global path and config variables            =
========================================================*/

const root = {
  app: 'app/',
  src: 'src/'
};
const app = {
  components: root.app + 'assets/components/',
  css: root.app + 'assets/css/',
  js: root.app + 'assets/js/'
};
const src = {
  components: root.src + 'components/',
  js: root.src + 'js/',
  scss: root.src + 'scss/'
};

const options = {
  browser: os.platform() === 'linux' ? 'google-chrome' : (
    os.platform() === 'darwin' ? 'google chrome' : (
    os.platform() === 'win32' ? 'chrome' : 'firefox')),
  browsers: [
    'last 2 version',
    'safari 6',
    'ie 9',
    'opera 12.1',
    'ios 6',
    'android 4'
  ],
  browserSync: {
    files: [app + '**'],
    port: 9992,
    server: {
      baseDir: root.app
    }
  },
  connect: {
    root: root.app,
    port: 9992
  },
  header: [
    '/**',
    ' * <%= pkg.name %>',
    ' * <%= pkg.title %>',
    ' * <%= pkg.url %>',
    ' * @author <%= pkg.author %>',
    ' * @version v<%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
  ].join('\n')
};

/**
 * Build bower components
 * https://github.com/zont/gulp-bower
 */

gulp.task('bower:dev', () => {
  return bower()
    .pipe(gulp.dest(app.components));
});
gulp.task('bower:dist', () => {
  return bower()
    .pipe(gulp.dest(app.components));
});

/**
 * Clean files and folders, remove generated files for clean deploy
 * https://github.com/peter-vilja/gulp-clean
 */

gulp.task('clean', () => {
  return gulp.src([
      app.assets + 'css/style.min.css',
      app.assets + 'css/style.min.css'
    ], {
      read: false
    })
    .pipe(clean());
});

/**
 * Concatenate JavaScript files, imports all .js files and appends project banner
 * https://github.com/contra/gulp-concat
 */

gulp.task('concat', () => {
  return gulp.src(src.js + '*.js')
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(app.js));
});

/**
 * Connect port, starts a local webserver
 * https://github.com/BrowserSync/browser-sync
 */

gulp.task('connect', () => {
  browserSync.init(options.browserSync);
});

/**
 * * Compile Sass/SCSS files
 * https://github.com/dlmanning/gulp-sass
 * Adds vendor prefixes automatically
 * https://github.com/sindresorhus/gulp-autoprefixer
 * CSS minification
 * https://github.com/chilijung/gulp-cssmin
 */

gulp.task('css', () => {
  return gulp.src([
      src.components + 'normalize-css/normalize.css',
      src.scss + 'style.scss'
    ])
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: options.browsers
    }))
    .pipe(cssmin())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(app.css))
    .pipe(browserSync.stream());
});

/**
 * Project banner, dynamically prepand to CSS/JS files
 * Inherits text from package.json
 * https://github.com/tracker1/gulp-header
 */

gulp.task('header', () => {
  return gulp.src([
      app.css + 'style.min.css',
      app.js + 'scripts.min.js'
    ])
    .pipe(header(options.header, {pkg: pkg}));
});

/**
 * JavaScript linter, manage the options inside .jshintrc file
 * https://github.com/spalger/gulp-jshint
 */

gulp.task('jshint', () => {
  return gulp.src([
      src.js + '*.js',
      'gulpfile.babel.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});

/**
 * Opens the web server in the browser
 * https://github.com/stevelacy/gulp-open
 */

gulp.task('open', () => {
  return gulp.src(__filename)
    .pipe(open({
      app: options.browser,
      uri: 'http://localhost:' + options.connect.port
    }));
});

/**
 * Compresses and minifies all JavaScript files into one
 * https://github.com/terinjokes/gulp-uglify
 */

gulp.task('uglify', (cb) => {
  return pump([
      gulp.src(src.js),
      uglify(),
      gulp.dest(app.js)
    ], cb);
});

/**
 * Runs tasks against changed watched files
 * https://github.com/floatdrop/gulp-watch
 */

gulp.task('watch', () => {
  gulp.watch(root.app + '*.html').on('change', browserSync.reload);
  gulp.watch(src.js + '**/*.js', ['concat', 'jshint', 'header']);
  gulp.watch(src.scss + '**/*.scss', ['css', 'header']);
});

/*======================================
=            Compiled Tasks            =
======================================*/

gulp.task('default', [
  'bower:dev',
  'css',
  'jshint',
  'concat',
  'header',
  'connect',
  'watch'
]);

/** Compresses all JS/CSS files */
gulp.task('build', [
  'sass:dist',
  'bower:dist',
  'autoprefixer:dist',
  'clean',
  'jshint',
  'uglify',
  'header'
]);

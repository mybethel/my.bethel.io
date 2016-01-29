/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssDependencies = [
  '.tmp/public/styles/app.css',
];

var testDependencies = [
  'socket.io-client/socket.io.js',
  'angular/angular.js',
].map(path => `node_modules/${path}`);

var libraryDependencies = [
  // Global libraries
  'outdated-browser/outdatedbrowser/outdatedbrowser.min.js',
  'chart.js/src/Chart.Core.js',
  'chart.js/src/Chart.Line.js',
  'lodash/lodash.js',
  'moment/min/moment.min.js',
  'video.js/dist/video.min.js',

  // Angular dependencies
  'angular-animate/angular-animate.min.js',
  'angular-aria/angular-aria.min.js',
  'angular-chart.js/dist/angular-chart.min.js',
  'angular-dom/dist/angular-dom.min.js',
  'angular-google-maps/dist/angular-google-maps.min.js',
  'angular-http-auth/src/http-auth-interceptor.js',
  'angular-material/angular-material.min.js',
  'angular-messages/angular-messages.min.js',
  'angular-moment/angular-moment.min.js',
  'angular-sails-socket/dist/angular-sails-socket.min.js',
  'angular-simple-logger/dist/angular-simple-logger.min.js',
  'angular-translate/dist/angular-translate.min.js',
  'angular-translate/dist/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
  'angular-ui-router/release/angular-ui-router.min.js',
  'angular-wizard/dist/angular-wizard.min.js',
  'angulartics/dist/angulartics.min.js',
  'angulartics/dist/angulartics-ga.min.js',
  'ng-file-upload/dist/ng-file-upload-all.min.js'
].map(path => `node_modules/${path}`);

// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsDependencies = [
  // Load sails.io before everything else
  'node_modules/sails.io.js/sails.io.js',
  'assets/shared/sharedConfig.js',
  'assets/shared/**/*.js',
  'assets/features/**/*Config.js',
  'assets/features/**/*Controller.js',
  'assets/app.js'
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateDependencies = [
  'templates/**/*.html'
].map(path => `assets/${path}`);

module.exports = {
  cssFilesToInject: cssDependencies,
  jsFilesToTest: testDependencies.concat(libraryDependencies).concat(jsDependencies),
  librariesToInject: libraryDependencies,
  frontendToInject: jsDependencies,
  jsFilesToInject: libraryDependencies.concat(jsDependencies),
  templateFilesToInject: templateDependencies
};

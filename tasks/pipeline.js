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
var cssFilesToInject = [
  'styles/app.css',
];

var testDependencies = [
  'components/socket.io-client/socket.io.js',
  'components/angular/angular.js',
];

var libraryDependencies = [
  // Global libraries
  'components/Chart.js/src/Chart.Core.js',
  'components/Chart.js/src/Chart.Line.js',
  'components/lodash/dist/lodash.min.js',
  'components/moment/min/moment.min.js',
  'components/videojs/dist/video-js/video.js',

  // Angular dependencies
  'components/angular-animate/angular-animate.min.js',
  'components/angular-aria/angular-aria.min.js',
  'components/angular-chart.js/dist/angular-chart.min.js',
  'components/angular-dom/dist/angular-dom.min.js',
  'components/angular-google-maps/dist/angular-google-maps.min.js',
  'components/angular-http-auth/src/http-auth-interceptor.js',
  'components/angular-material/angular-material.min.js',
  'components/angular-messages/angular-messages.min.js',
  'components/angular-moment/angular-moment.min.js',
  'components/angular-translate/angular-translate.min.js',
  'components/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
  'components/angular-ui-router/release/angular-ui-router.min.js',
  'components/angular-wizard/dist/angular-wizard.min.js',
  'components/angulartics/dist/angulartics.min.js',
  'components/angulartics/dist/angulartics-ga.min.js',
  'components/ng-file-upload/ng-file-upload.min.js',
  'components/ng-file-upload/ng-file-upload-shim.min.js',
];

// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [
  // Load sails.io before everything else
  'shared/sails.io.js',
  'shared/sharedConfig.js',
  'shared/**/*.js',
  'features/**/*Config.js',
  'features/**/*Controller.js',
  'app.js'
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
var templateFilesToInject = [
  'templates/**/*.html'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToTest = testDependencies.concat(libraryDependencies).concat(jsFilesToInject).map(function(path) {
  return 'assets/' + path;
});

module.exports.librariesToInject = libraryDependencies.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.frontendToInject = jsFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});

module.exports.jsFilesToInject = libraryDependencies.concat(jsFilesToInject).map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
  return 'assets/' + path;
});

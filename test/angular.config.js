module.exports = function(config) {
  config.set({
    basePath: './../',
    frameworks: ['jasmine'],
    files: require('../tasks/pipeline').jsFilesToTest.concat([
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/video.js/dist/video.js',
      'test/angular/*.js'
    ]),
    preprocessors: {
      'assets/features/**/*.js': 'coverage',
      'assets/js/app.js': 'coverage',
      'assets/js/**/!(dependencies)/*.js': 'coverage'
    },
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      reporters: [
        { type: 'json', subdir: 'angular' },
        { type: 'lcov', subdir: 'angular' }
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};

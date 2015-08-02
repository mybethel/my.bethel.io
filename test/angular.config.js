module.exports = function(config) {
  config.set({
    basePath: './../',
    frameworks: ['jasmine'],
    files: require('../tasks/pipeline').jsFilesToTest.concat([
      'assets/components/angular/angular.js',
      'assets/components/angular-mocks/angular-mocks.js',
      'test/angular/*.js'
    ]),
    preprocessors: {
      'assets/features/**/*.js': 'coverage',
      'assets/js/app.js': 'coverage',
      'assets/js/**/!(dependencies)/*.js': 'coverage',
      'assets/shared/*.js': 'coverage'
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

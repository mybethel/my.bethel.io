exports.config = {
  capabilities: {
    'browserName': 'firefox'
  },
  framework: 'jasmine2',
  onPrepare: function() {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));
  },
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
    print: function() {},
    showColors: true
  },
  rootElement: 'html',
  specs: [
    'bootstrap.test.js',
    'e2e/*.js'
  ]
};

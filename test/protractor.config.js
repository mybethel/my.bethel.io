exports.config = {
  specs: [
    'bootstrap.test.js',
    'e2e/*.js'
  ],
  framework: 'mocha',
  mochaOpts: {
    reporter: 'spec',
    slow: 3000,
    enableTimeouts: false
  },
  capabilities: {
    'browserName': 'chrome'
  }
};
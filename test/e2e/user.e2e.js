var expect = require('expect.js');

describe('Dashboard', function(){ 
  it('requires users to login.', function() {
    browser.get('/#!/dashboard');

    // Welcome back title.
    element(by.css('h2.title')).getText().then(function (text) { 
      expect(text).to.be('Welcome back!'); 
    });
    // Login form main wrapping element.
    element(by.css('form.user-form')).isPresent().then(function (el) {
      expect(el).to.be(true);
    });
    // New user create account link.
    element(by.css('a.panel-footer')).isPresent().then(function (el) {
      expect(el).to.be(true);
    });

  }); 
});
var expect = require('expect.js');

describe('Dashboard', function() {

  it('requires users to login.', function() {
    browser.get('/#/dashboard');

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

  before(function() {
    protractor.promise.controlFlow().execute(function() {

      var deferred = new protractor.promise.Deferred();

      Ministry.create({
        name: 'Public Relations'
      }, function (err, ministry) {
        User.create({
          name: 'Jayne Cobb',
          email: 'test@bethel.io',
          password: 'v3ra',
          ministry: ministry.id
        }, function (err, user) {
          if (err) console.log(err);
          deferred.fulfill(true);
        });
      });

      return deferred.promise;
    });
  });

  it('should warn on missing or invalid credentials.', function() {

    element(by.model('credentials.name')).sendKeys('test@bethel.io');
    element(by.model('credentials.name')).submit();

    element(by.css('.form-item-pass.has-error')).isPresent().then(function (el) {
      expect(el).to.be(true);
    });

  });

  it('should accept valid login credentials.', function() {

    element(by.model('credentials.pass')).sendKeys('v3ra');
    element(by.model('credentials.pass')).submit();

    browser.wait(function() {
      return element(by.css('.panel.me h3 span')).isPresent().then(function (el) {
        return el === true;
      });
    }).then(function() {
      element(by.css('.panel.me h3 span')).getText().then(function (text) {
        expect(text).to.equal('Jayne Cobb');
      });
    });

  });

});
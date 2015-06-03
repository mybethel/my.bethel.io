var expect = require('expect.js');

describe('Dashboard', function() {

  it('requires users to login.', function() {
    browser.get('/#/dashboard');

    // Login form main wrapping element.
    element(by.css('form[name="userLoginForm"]')).isPresent().then(function (el) {
      expect(el).to.be(true);
    });
    // New user create account link.
    element(by.css('md-card-footer a')).isPresent().then(function (el) {
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

    element(by.css('input[name="password"].ng-invalid-required')).isPresent().then(function (el) {
      expect(el).to.be(true);
    });

  });

  it('should accept valid login credentials.', function() {

    element(by.model('credentials.pass')).sendKeys('v3ra');
    element(by.model('credentials.pass')).submit();

    browser.wait(function() {
      return element(by.css('.welcome-modal h2')).isPresent().then(function (el) {
        return el === true;
      });
    }).then(function() {
      element(by.css('.welcome-modal h2')).getText().then(function (text) {
        expect(text).to.equal('Welcome, Jayne Cobb');
      });
    });

  });

});

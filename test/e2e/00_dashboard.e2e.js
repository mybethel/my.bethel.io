describe('Dashboard', function() {

  it('requires users to login.', function() {
    browser.get('#/dashboard');

    // Login form main wrapping element.
    expect(element(by.css('form[name="userLoginForm"]')).isPresent()).toBe(true);
    // New user create account link.
    expect(element(by.css('md-card-footer a')).isPresent()).toBe(true);

  });

  beforeAll(function() {
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
          if (err) deferred.reject(err);
          deferred.fulfill(true);
        });
      });

      return deferred.promise;
    });
  });

  it('should warn on missing or invalid credentials.', function() {

    element(by.model('credentials.name')).sendKeys('test@bethel.io');
    element(by.model('credentials.name')).submit();

    expect(element(by.css('input[name="password"].ng-invalid-required')).isPresent()).toBe(true);

  });

  it('should accept valid login credentials.', function() {

    element(by.model('credentials.pass')).sendKeys('v3ra');
    element(by.css('button')).click();

    browser.wait(function() {
      return element(by.css('.welcome-modal h2')).isPresent().then(function (el) {
        return el === true;
      });
    }, 2000).then(function() {
      expect(element(by.css('.welcome-modal h2')).getText()).toBe('Welcome, Jayne Cobb');
    });

  });

});

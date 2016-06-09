const expect = require('expect');
const request = require('supertest');

const fixtures = require('../fixtures');

describe('user', function() {

  var authenticatedUser, newUser;

  it('allows the creation of a user', function(done) {
    User.create(fixtures.user).exec(function(err, user) {
      expect(user.name).toEqual(fixtures.user.name);
      newUser = user;
      done(err);
    });
  });

  it('creates a default password with the invite code', function(done) {
    User.create(fixtures.invitedUser).exec(function(err, user) {
      expect(user.password).toExist();
      done(err);
    });
  });

  it('provides a default gravatar for new users', () => {
    expect(newUser.avatar).toContain('e3c0f7eb6a7965032ef2e2210909a22b');
  });

  it('prevents anonymous users from seeing the user list', function(done) {
    request(sails.hooks.http.app)
      .get('/user')
      .expect(403, done);
  });

  it('allows valid users to login', done => {
    authenticatedUser = request.agent(sails.hooks.http.app);
    authenticatedUser
      .post('/session/create')
      .send({ name: fixtures.user.email, pass: fixtures.user.password })
      .expect(200, done);
  });

  it('allows valid users to login', done => {
    authenticatedUser
      .post('/user/update')
      .send({ name: 'Albert C Martin' })
      .expect(200, done);
  });

  it('updates the last login date of the user', function(done) {
    User.findOne({ email: fixtures.user.email }).then(user => {
      expect(user.lastLogin).toExist();
      done();
    });
  });

  describe('roles', function() {

    it('allows a user to have multiple roles', function(done) {
      newUser.roles = ['ROLE_SUPER_ADMIN', 'ROLE_USER'];
      newUser.save(done);
    });

    it('validates whether or not a user has a role', function() {
      expect(newUser.hasRole('ROLE_SUPER_ADMIN')).toBe(true);
    });

    it('validates whether or not a user has a role', function() {
      expect(newUser.hasRole('ROLE_SUPER_HERO')).toBe(false);
    });

  });

});

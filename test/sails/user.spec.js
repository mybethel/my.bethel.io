const expect = require('expect');
const request = require('supertest');

var fixtures = require('../fixtures');

describe('users', function() {

  var createdUser;

  it('allows the creation of a user', done => {
    User.create(fixtures.user).exec((err, user) => {
      createdUser = user;
      if (err) return done(err);
      expect(user.name).toEqual(fixtures.user.name);
      done();
    });
  });

  it('prohibits multiple users with the same e-mail', done => {
    User.create(fixtures.user).exec(err => {
      expect(err).toExist();
      done();
    });
  });

  it('forces the e-mail address to lowercase', done => {
    User.update({ email: fixtures.user.email }, { email: fixtures.user.email.toUpperCase() })
      .then(user => {
        expect(user[0].email).toEqual(fixtures.user.email);
        done();
      })
      .catch(done);
  });

  it('encodes the user password', done => {
    expect(createdUser.password).toNotEqual(fixtures.user.password);
    require('bcrypt').compare(fixtures.user.password, createdUser.password, (err, valid) => {
      expect(valid).toEqual(true);
      done(err);
    });
  });

  it('constructs a gravatar URL for the user avatar', () => {
    expect(createdUser.getAvatar()).toEqual('//gravatar.com/avatar/06782fa1fde3e919a3ab224d3b22dbfa.png?d=mm&s=');
    expect(createdUser.getAvatar(50)).toEqual('//gravatar.com/avatar/06782fa1fde3e919a3ab224d3b22dbfa.png?d=mm&s=50');
  });

  it('creates an invite code for new users default password', done => {
    User.create({
      email: 'invite@bethel.io',
      name: 'New User'
    }).exec((err, user) => {
      if (err) return done(err);

      require('bcrypt').compare(User.inviteCode('invite@bethel.io'), user.password, (err, valid) => {
        expect(valid).toEqual(true);
        done(err);
      });
    });
  });

  it('protects the user list against anonymous access', done => {
    request(sails.hooks.http.app)
      .get('/user')
      .expect(403, done);
  });

  var authenticatedUser;

  describe('login', () => {

    it('prohibits login attempts without credentials', done => {
      request(sails.hooks.http.app)
        .post('/session/create')
        .expect(403, done);
    });

    it('rejects invalid login attempts', done => {
      request(sails.hooks.http.app)
        .post('/session/create')
        .field('name', 'nope@nothere.com')
        .field('pass', 'nope')
        .expect(403, done);
    });

    it('rejects invalid password attempts', done => {
      request(sails.hooks.http.app)
        .post('/session/create')
        .field('name', fixtures.user.email)
        .field('pass', 'invalid')
        .expect(403, done);
    });

    it('allows valid users to login', done => {
      authenticatedUser = request.agent(sails.hooks.http.app);
      authenticatedUser
        .post('/session/create')
        .send({ name: fixtures.user.email, pass: fixtures.user.password })
        .expect(200, done);
    });

    it('identifies a logged in user by their session', done => {
      authenticatedUser
        .get('/session/current')
        .expect(200, done);
    });

    it('prohibits standard users from seeing other users', done => {
      authenticatedUser
        .get('/user')
        .expect(403, done);
    });

    it('permits a user to log out', done => {
      authenticatedUser
        .get('/session/destroy')
        .expect(302, done);
    });

    it('destroys the session when a user logs out', done => {
      authenticatedUser
        .get('/session/current')
        .expect(403, done);
    });

  });

  describe('administrators', () => {

    before(done => User.create({
      email: 'admin@bethel.io',
      name: 'Administrator',
      password: 'admin123',
      roles: ['ROLE_SUPER_ADMIN']
    }).exec(done));

    before(done => {
      authenticatedUser = request.agent(sails.hooks.http.app);
      authenticatedUser
        .post('/session/create')
        .send({ name: 'admin@bethel.io', pass: 'admin123' })
        .expect(200, done);
    });

    it('allows administrators to view other users', done => {
      authenticatedUser
        .get('/user')
        .expect(200, done);
    });

    it('removes user passwords from results', done => {
      authenticatedUser
        .get('/user')
        .expect(200, (err, response) => {
          expect(response.body[0].password).toNotExist();
          done(err);
        });
    });

    it('includes computed property for avatar', done => {
      authenticatedUser
        .get('/user')
        .expect(200, (err, response) => {
          expect(response.body[0].avatar).toExist();
          done(err);
        });
    });

    it('includes computed property for invite code', done => {
      authenticatedUser
        .get('/user')
        .expect(200, (err, response) => {
          expect(response.body[0].inviteCode).toExist();
          done(err);
        });
    });

  });

});

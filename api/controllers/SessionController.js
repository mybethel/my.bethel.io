/**
 * SessionController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  /**
   * Query all ministries that the current user is authorized to manage. This
   * will be displayed on the front-end to allow for quickly switching between
   * ministries for users who require this capability.
   */
  authorized: function(req, res) {
    User.findOne(req.session.user).populate('ministry').exec((err, user) => {
      if (err || !user)
        return res.forbidden({ error: 'Please login at http://my.bethel.io' });

      if (!user.ministriesAuthorized || user.ministriesAuthorized.length < 1) {
        return res.send([user.ministry]);
      }

      var ministryIds = user.ministriesAuthorized;
      ministryIds.push(user.ministry.id);

      Ministry.find({ id: ministryIds }).exec((err, ministries) => res.send(ministries));
    });
  },

  create: function(req, res, next) {
    if (!req.param('name') || !req.param('pass'))
      return res.forbidden({ error: { name: true, pass: true } });

    User.findOneByEmail(req.param('name')).exec(function foundUser(err, user) {
      if (err) {
        sails.log.error(err);
        return next(err);
      }

      if (!user)
        return res.forbidden({ error: { name: true } });

      require('bcrypt').compare(req.param('pass'), user.password, function(err, valid) {
        if (err) return next(err);

        if (!valid)
          return res.forbidden({ error: { pass: true } });

        req.session.authenticated = true;
        req.session.user = user.id;
        req.session.ministry = user.ministry;
        req.session.isAdmin = user.hasRole('ROLE_SUPER_ADMIN');

        user.loginSuccess();

        return res.send({
          user: user,
          ministry: user.ministry,
          isAdmin: user.hasRole('ROLE_SUPER_ADMIN')
        });
      });
    });
  },

  current: function(req, res) {
    if (!req.session.user)
      return res.forbidden({ error: 'Please login at http://my.bethel.io' });

    User.findOne(req.session.user).exec((err, user) => {
      if (err || !user)
        return res.forbidden({ error: 'Please login at http://my.bethel.io' });

      Ministry.findOne(req.session.ministry).exec((err, ministry) => {
        if (err || !ministry)
          return res.forbidden({ error: 'Please login at http://my.bethel.io' });

        var payload = {
          user: user,
          ministry: ministry,
          isAdmin: user.hasRole('ROLE_SUPER_ADMIN') || req.session.isAdmin,
          previousUser: req.session.previousUser
        };

        if (req.session.previousUser) return;

        User.update(req.session.user, { lastLogin: new Date() }, function (err, user) {
          if (err)
            return res.forbidden({ error: 'Please login at http://my.bethel.io' });

          payload.user.lastLogin = user.lastLogin;
          res.send(payload);
        });
      });
    });
  },

  masquerade: function(req, res) {

    req.session.user = req.param('user').id;
    req.session.ministry = req.param('user').ministry.id;
    req.session.previousUser = req.param('previousUser');
    req.session.isAdmin = true;

    res.ok();
  },

  /**
   * Provides the ability for a user to switch between multiple ministries that
   * they have previously been authorized to manage. This temporarily modifies
   * their session to the ID of a different ministry similar to how "masquerade"
   * works for Bethel Staff users.
   */
  ministry: function(req, res) {
    if (!req.param('id')) return res.badRequest('ministry ID required');
    User.findOne(req.session.user).exec((err, user) => {
      if (user.ministry != req.param('id') && user.ministriesAuthorized.indexOf(req.param('id')) === -1)
        return res.forbidden('you are not authorized to manage this ministry');

      req.session.ministry = req.param('id');
      res.redirect('/');
    });
  },

  destroy: function(req, res) {
    req.session.destroy();
    return res.redirect('/');
  }

};

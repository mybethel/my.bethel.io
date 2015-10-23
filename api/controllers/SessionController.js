/**
 * SessionController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

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

    User.findOne(req.session.user).populate('ministry').exec(function (err, user) {
      if (err || !user)
        return res.forbidden({ error: 'Please login at http://my.bethel.io' });

      res.send({
        user: user,
        ministry: user.ministry,
        isAdmin: user.hasRole('ROLE_SUPER_ADMIN') || req.session.isAdmin,
        previousUser: req.session.previousUser
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

  destroy: function(req, res) {
    req.session.destroy();
    return res.redirect('/');
  }

};

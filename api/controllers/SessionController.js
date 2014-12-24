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

    User.findOneByEmail(req.param('name'), function foundUser(err, user) {
      if (err) console.log(err);
      if (err) return next(err);

      if (!user)
        return res.forbidden({ error: { name: true } });

      require('bcrypt').compare(req.param('pass'), user.password, function(err, valid) {
        if (err) return next(err);

        if (!valid)
          return res.forbidden({ error: { pass: true } });

        req.session.authenticated = true;
        req.session.User = user;

        if (user.roles && user.roles.indexOf('ROLE_SUPER_ADMIN') > -1) {
          req.session.isAdmin = true;
        }

        var ministryId = user.ministry;
        if (ministryId) {
          Ministry.findOneById(ministryId, function foundMinistry(err, ministry) {
            if (err) return next(err);

            if (ministry) {
              req.session.Ministry = ministry;
            }

            return res.send({ success: 'welcome' });
          });
        } else {
          return res.send({ success: 'welcome' });
        }
      });
    });
  },

  current: function(req, res, next) {
    if (req.session.User) {
      User.findOne(req.session.User.id, function (err, user) {
        res.send({
          user: user,
          ministry: req.session.Ministry,
          isAdmin: user.hasRole('ROLE_SUPER_ADMIN')
        });
      });
    } else {
      res.forbidden({ error: 'Please login at http://my.bethel.io' });
    }
  },

  destroy: function(req, res, next) {
    req.session.destroy();

    return res.redirect('/');
  }

};

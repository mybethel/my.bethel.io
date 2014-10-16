/**
 * SessionController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  create: function(req, res, next) {
    if (!req.param('name') || !req.param('pass'))
      return res.send(401, { error: { name: true, pass: true } });

    User.findOneByEmail(req.param('name'), function foundUser(err, user) {
      if (err) return next(err);

      if (!user)
        return res.send(401, { error: { name: true } });

      require('bcrypt').compare(req.param('pass'), user.password, function(err, valid) {
        if (err) return next(err);

        if (!valid)
          return res.send(401, { error: { pass: true } });

        req.session.authenticated = true;
        req.session.User = user;

        var ministryId = user.ministry;
        if (ministryId) {
          Ministry.findOneById(ministryId, function foundMinistry(err, ministry) {
            if (err) return next(err);

            if (ministry) {
              req.session.Ministry = ministry;
            }

            return res.send(200, {success:'welcome'});
          });
        } else {
          return res.redirect('/welcome');
        }
      });
    })
  },

  current: function(req, res, next) {
    if (req.session.User && req.session.Ministry) {
      User.findOne(req.session.User.id, function (err, user) {
        res.send({
          user: user,
          ministry: req.session.Ministry,
          isAdmin: user.hasRole('ROLE_SUPER_ADMIN')
        });
      })
    } else {
      res.send(401, { error: 'Please login at http://my.bethel.io/login' });
    }
  },

  destroy: function(req, res, next) {
    req.session.destroy();

    return res.redirect('/');
  }
	
};

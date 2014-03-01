/**
 * SessionController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  create: function(req, res, next) {
    if (!req.param('name') || !req.param('pass')) {
      req.session.flash = {
        err: [{id: 'login', error: 'You must provide both an e-mail address and password.'}]
      }

      return res.redirect('/login');
    }

    User.findOneByEmail(req.param('name'), function foundUser(err, user) {
      if (err) return next(err);

      if (!user) {
        req.session.flash = {
          err: [{id: 'login', error: 'No account was found for ' + req.param('name') + '.'}]
        }

        return res.redirect('/login');
      }

      require('bcrypt').compare(req.param('pass'), user.password, function(err, valid) {
        if (err) return next(err);

        if (!valid) {
          req.session.flash = {
            err: [{id: 'login', error: 'The password you entered was incorrect.'}]
          }

          return res.redirect('/login');
        }

        req.session.authenticated = true;
        req.session.User = user;

        return res.redirect('/');
      });
    })
  },

  destroy: function(req, res, next) {
    req.session.destroy();

    return res.redirect('/login');
  }
	
};

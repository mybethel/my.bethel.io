/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  login: function (req, res) {
    res.view();
  },

  new: function (req, res) {
    res.view();
  },

  create: function (req, res) {
    User.create(req.params.all(), function userCreated (err, user) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/register');
      }

      req.session.authenticated = true;
      req.session.User = user;
      req.session.flash = {};

      return res.redirect('/welcome');
    });
  },

  update: function(req, res) {
    User.update(req.param('id'), req.params.all(), function userUpdated(err, user) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/welcome');
      }
      req.session.flash = {};

      if (user[0] && user[0].id === req.session.User.id) {
        req.session.User = user[0];

        Ministry.findOne(user[0].ministry, function foundMinistry(err, ministry) {
          if (err) return next(err);

          if (ministry) {
            req.session.Ministry = ministry;
          }
        });
      }

      return res.redirect('/');
    });
  },

  welcome: function (req, res) {
    res.view({user: req.session.User});
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {
    actions: false,
    shortcuts: false,
    rest: false
  }

};

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

  welcome: function (req, res) {
    res.view();
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};

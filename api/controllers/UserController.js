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

var jtsEngine = require('jts');
var JTS = new jtsEngine();

module.exports = {

  login: function(req, res) {
    res.view();
  },

  invite: function(req, res) {

    var inviteCode = req.param('inviteCode'),
        userId = new Buffer(inviteCode.replace('-', '+').replace('_', '/'), 'base64').toString('hex');

    if (req.session.user) {
      return res.redirect('/');
    }

    User.findOne(userId).exec(function(err, user) {
      if (err) return res.serverError(err);

      if (!user) return res.forbidden('Invalid invite code');

      user.inviteCode = req.param('inviteCode');
      return res.view({ invitedUser: JSON.stringify(user) });

    });

  },

  signup: function(req, res) {
    res.view();
  },

  register: function(req, res) {

    var registerCode = req.param('registerCode'),
        userId = new Buffer(registerCode.replace('-', '+').replace('_', '/'), 'base64').toString('hex');

    if (req.session.user) {
      return res.redirect('/');
    }

    User.findOne(userId).exec(function(err, user) {
      if (err) return res.serverError(err);
      if (!user) return res.forbidden('Invalid registration link');

      user.registerCode = new Buffer(user.email).toString('base64').replace('+', '-').replace('/', '_');
      return res.view({ registeringUser: JSON.stringify(user) });

    });

  },

  sendRegistration: function(req, res) {

    User.findOne(req.param('id')).exec(function(err, user) {
      if (err) return res.serverError(err);
      if (!user) return res.serverError('No user found with that id');

      var registerCode = new Buffer(user.id, 'hex').toString('base64').replace('+', '-').replace('/', '_'),
          templateVars = { confirmationUrl: req.headers.origin + '/register/' + registerCode },
          file = JTS.read('views/email/register.jts');

      var mailOptions = {
        to: user.email,
        subject: 'Register for Bethel!',
        message: JTS.compile(file, templateVars)
      };

      Mailgun.sendMail(mailOptions, function(err, results) {
        console.log('ERR ', err);
        if (err) return res.serverError({ error: err });
        res.ok('success');
      });

    });

  },

  sendInvite: function(req, res) {

    User.findOne(req.param('id')).exec(function(err, user) {
      if (err) return res.serverError(err);
      if (!user) return res.serverError('No user found with that id');

      var inviteCode = new Buffer(user.id, 'hex').toString('base64').replace('+', '-').replace('/', '_'),
          templateVars = {
            userName: user.name,
            confirmationUrl: req.headers.origin + '/invite/' + inviteCode
          },
          file = JTS.read('views/email/invite.jts');

      var mailOptions = {
        to: user.email,
        subject: 'Welcome to Bethel!',
        message: JTS.compile(file, templateVars)
      };

      Mailgun.sendMail(mailOptions, function(err, results) {
        console.log('ERR ', err);
        if (err) return res.serverError({ error: err });
        res.ok('success');
      });

    });

  },

  update: function(req, res) {
    User.update(req.param('id'), req.params.all(), function userUpdated(err, user) {
      if (err) return res.badRequest(err);

      return res.send(user);
    });
  },

  lockUnlock: function(req, res) {

    User.findOne(req.param('id')).exec(function(err, user) {
      if (err) return next(err);

      User.update(user.id, { isLocked: !user.isLocked }, function(err, updatedUser) {
        if (err) return res.serverError(err);

        res.send(updatedUser[0]);

      });

    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {
    // actions: false,
    shortcuts: false,
    // rest: false
  }

};

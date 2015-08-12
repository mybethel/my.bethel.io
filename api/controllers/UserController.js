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

var Mandrill = require('machinepack-mandrill');

module.exports = {

  login: function (req, res) {
    res.view();
  },

  new: function (req, res) {
    res.view();
  },

  invite: function (req, res) {

    var inviteCode = req.param('inviteCode'),
        userId = new Buffer(inviteCode.replace('-','+').replace('_','/'), 'base64').toString('hex');

    if (req.session.User) {
      return res.redirect('/');
    }

    User.findOne(userId).exec(function (err, user) {
      if (err) return res.serverError(err);

      if (!user) return res.forbidden('Invalid invite code');

      user.inviteCode = req.param('inviteCode');
      return res.view({invitedUser: JSON.stringify(user)});

    });

  },

  sendInvite: function (req, res) {

    User.findOne(req.param('id')).exec(function (err, user) {
      if (err) return res.serverError(err);

      if (!user) return res.serverError('No user found with that id');

      var inviteCode = new Buffer(user.id, 'hex').toString('base64').replace('+','-').replace('/','_'),
          inviteUrl = sails.getBaseurl() + '/invite/' + inviteCode,
          currentDate = new Date(),
          templateVariables = [
            {name: 'inviteUrl', content: inviteUrl},
            {name: 'userName', content: user.name},
            {name: 'year', content: new Date().getFullYear()}
          ];

      Mandrill.sendTemplateEmail({
        apiKey: sails.config.mandrill.key,
        toEmail: user.email,
        templateName: 'beta-invite',
        toName: user.name,
        subject: 'Welcome to Bethel!',
        fromEmail: 'hello@bethel.io',
        fromName: 'Bethel',
        mergeVars: templateVariables,
      }).exec({
        error: function (err) {
          return res.send({error: 'There was a problem sending the invite email.'});
        },
        success: function () {
          User.update(user.id, {invited: currentDate}, function (err, updatedUser) {
            if (err) return res.serverError(err);
            return res.ok(updatedUser[0]);
          });
        },
      });

    });

  },

  update: function(req, res) {
    User.update(req.param('id'), req.params.all(), function userUpdated(err, user) {
      if (err) return res.badRequest(err);

      if (user[0] && user[0].id === req.session.User.id) {
        req.session.User = user[0];

        Ministry.findOne(user[0].ministry, function foundMinistry(err, ministry) {
          if (err) return next(err);

          if (ministry) {
            req.session.Ministry = ministry;
          }

          return res.send(user);
        });
      }
    });
  },

  lockUnlock: function (req, res) {

    var isLocked;

    User.findOne(req.param('id')).exec(function (err, user) {
      if (err) return next(err);

      User.update(user.id, {isLocked: !user.isLocked}, function (err, updatedUser) {
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

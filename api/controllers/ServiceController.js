/**
 * ServiceController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var passport = require('passport');

module.exports = {

  connect: function(req, res, next) {
    var service = req.param('id');

    if (!sails.config.services[service])
      res.send(404);

    passport.authenticate(service)(req, res);
  },

  authorize: function(req, res, next) {
    var service = req.param('id');

    if (!sails.config.services[service])
      res.send(404);

    passport.authenticate(service, { successRedirect: '/service',
                                     failureRedirect: '/service' })(req, res);
  }
	
};

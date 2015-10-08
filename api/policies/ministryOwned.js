/**
 * ministryOwned
 *
 * @module      :: Policy
 * @description :: Blocks access to models not owned by the ministry associated
 *                 with the currently logged in user.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  if (!req.options.controller || !sails.models[req.options.controller]) {
    return next();
  }

  sails.models[req.options.controller].findOne(req.param('id'), function (err, object) {

    if (err) return res.badRequest();

    if (object.id !== req.session.ministry && object.ministry !== req.session.ministry) {
      return res.forbidden();
    }

    return next();

  });


};

/**
 * platformStaff
 *
 * @module      :: Policy
 * @description :: Restricts certain routes access to Bethel Staff
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  if (req.session.User && req.session.User.roles && req.session.isAdmin) {
    return next();
  }

  return res.forbidden();

};

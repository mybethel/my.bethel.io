/**
 * platformStaff
 *
 * @module      :: Policy
 * @description :: Restricts certain routes access to bethel Staff
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  if (req.session.User && req.session.User.hasRole('ROLE_SUPER_ADMIN')) {
    return next();
  }

  return res.redirect('/');

};

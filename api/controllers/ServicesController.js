/**
 * ServicesController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  vimeo: function(req, res, next) {
    var Vimeo = require('vimeo-api').Vimeo,
        VimeoAPI = new Vimeo('4990932cb9c798b238e98108b4890c59497297ba', process.env.VIMEO),
        redirectUrl = 'http://my.bethel.io/services/vimeo/authorized';

    // If this is not a response from Vimeo, redirect the user to request permission.
    if (req.param('id') !== 'authorized') {
      var url = VimeoAPI.buildAuthorizationEndpoint(redirectUrl, ['public', 'private'], req.session.Ministry.id.toString('base64'));
      return res.redirect(url);
    }

    // Construct and store the access token based on the Vimeo response.
    VimeoAPI.accessToken(req.query.code, redirectUrl, function (err, token, status, headers) {
      if (err) return next(err);

      if (req.query.state !== req.session.Ministry.id.toString('base64') || typeof token.access_token === 'undefined')
        return res.forbidden('Invalid access token response from Vimeo.');

      Services.findOrCreate({
        'provider': 'vimeo',
        'ministry': req.session.Ministry.id,
        'user': token.user.uri
      }, {
        'provider': 'vimeo',
        'ministry': req.session.Ministry.id,
        'user': token.user.uri,
        'accessToken': token.access_token,
        'scope': token.scope,
        'link': token.user.link,
        'name': token.user.name,
        'picture': token.user.pictures[0].link
      }, function(err, user) {
        if (err) sails.log.error(err);

        res.redirect('/#/dashboard/accounts');
      });
    });
  }
	
};

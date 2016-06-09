/**
 * ServiceController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
const Vimeo = require('vimeo').Vimeo;

module.exports = {

  vimeo: function(req, res, next) {
    var VimeoAPI = new Vimeo(sails.config.services.vimeo.key, sails.config.services.vimeo.secret),
        redirectUrl = 'http://my.bethel.io/service/vimeo/authorized';

    // If this is not a response from Vimeo, redirect the user to request permission.
    if (req.param('id') !== 'authorized') {
      var url = VimeoAPI.buildAuthorizationEndpoint(redirectUrl, ['public', 'private'], req.session.ministry.toString('base64'));
      return res.redirect(url);
    }

    // Construct and store the access token based on the Vimeo response.
    VimeoAPI.accessToken(req.query.code, redirectUrl, function(err, token) {
      if (err) return next(err);

      if (req.query.state !== req.session.ministry.toString('base64') || typeof token.access_token === 'undefined')
        return res.forbidden('Invalid access token response from Vimeo.');

      Service.findOrCreate({
        'provider': 'vimeo',
        'ministry': req.session.ministry,
        'user': token.user.uri
      }, {
        'provider': 'vimeo',
        'ministry': req.session.ministry,
        'user': token.user.uri,
        'accessToken': token.access_token,
        'scope': token.scope,
        'link': token.user.link,
        'name': token.user.name
      }, function(err) {
        if (err) sails.log.error(err);

        res.redirect('/#/dashboard/accounts');
      });
    });
  },

  youtube: function(req, res) {
    var OAuth2 = require('googleapis').auth.OAuth2;
    var oauth2Client = new OAuth2(sails.config.services.youtube.key, sails.config.services.youtube.secret, 'https://my.bethel.io/service/youtube/authorized');

    if (req.param('id') !== 'authorized') {
      var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: sails.config.services.youtube.scope,
        state: req.session.ministry
      });

      return res.redirect(url);
    }

    oauth2Client.getToken(req.query.code, function (err, token) {
      if (err) return res.forbidden(err);

      Service.findOrCreate({
        'provider': 'youtube',
        'ministry': req.session.ministry,
      }, {
        'provider': 'youtube',
        'ministry': req.session.ministry,
        'accessToken': token.access_token,
        'refreshToken': token.refresh_token,
        'expires': token.expiry_date,
      }, function (err) {
        if (err) return res.forbidden(err);

        res.redirect('/#/dashboard/accounts');
      });
    });
  }

};

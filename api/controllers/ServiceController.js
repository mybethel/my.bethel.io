/**
 * ServiceController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  new: function(req, res) {
    res.view({
      layout: req.viewData.layout
    });
  },

  list: function (req, res) {
    Services.find({ministry: req.session.Ministry.id}, function foundServices(err, allServices) {
      if (err) return next(err);

      res.send(200, allServices);
    });
  },

  vimeo: function(req, res, next) {
    var Vimeo = require('vimeo-api').Vimeo,
        VimeoAPI = new Vimeo('4990932cb9c798b238e98108b4890c59497297ba', process.env.VIMEO),
        redirectUrl = 'http://my.bethel.io/service/vimeo/authorized';

    if (req.param('id') !== 'authorized') {
      var url = VimeoAPI.buildAuthorizationEndpoint(redirectUrl, new Array('public', 'private'), req.session.Ministry.id.toString('base64'))
      res.redirect(url);
    } else {
      VimeoAPI.accessToken(req.query.code, redirectUrl, function (err, token, status, headers) {
        if (err)
          res.send(500, err);

        if (req.query.state === req.session.Ministry.id.toString('base64') && token && token.access_token) {
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
            if (err)
              sails.log.error(err);

            res.redirect('/accounts');
          });
        }
      });
    }
  }
	
};

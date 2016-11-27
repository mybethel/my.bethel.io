/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {

  middleware: {

    order: [
      'startRequestTimer',
      'cookieParser',
      'session',
      'jsonParser',
      'hostnameRedirect',
      'compress',
      'methodOverride',
      'poweredBy',
      '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ],

    // Prevent users from accessing the entire site at the `io` subdomain.
    hostnameRedirect: function(req, res, next) {
      var host = req.header('host');

      if (host === 'io.bethel.io' && req.url.indexOf('/socket.io') !== 0) {
        return res.redirect(301, 'https://my.bethel.io');
      }

      return next();
    },

    jsonParser: require('body-parser').json(),

    poweredBy: function(req, res, next) {
      res.header('X-Powered-By', 'Bethel Technologies');
      next();
    },

  }

};

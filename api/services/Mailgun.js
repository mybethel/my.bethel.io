const request = require('request');

const mailgunUrl = `https://api:${sails.config.mailgun.key}@api.mailgun.net/v3/${sails.config.mailgun.domain}/messages`;

exports.sendMail = function(options, cb) {
  request.post({
    url: mailgunUrl,
    form: {
      from: 'Bethel <hello@bethel.io>',
      to: options.to,
      subject: options.subject,
      html: options.message
    }
  }, function(err, response, body) {
    if (err || response.statusCode >= 400) {
      return cb(err || JSON.parse(body).message);
    }
    cb(null, JSON.parse(body).message);
  });
};

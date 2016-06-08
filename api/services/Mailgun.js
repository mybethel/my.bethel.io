request = require('request');

var apiKey = sails.config.mailgun.key;
var domain = sails.config.mailgun.domain;

exports.sendMail = function(options, cb) {
  var emailPart = 'hello@bethel.io',
      namePart = 'Bethel';
  var fromFormat = namePart + " <" + emailPart + ">";

  var url = "https://api:" + apiKey + "@api.mailgun.net/v3/" + domain + "/messages";

  var mailData = {
    from: fromFormat,
    to: options.to,
    subject: options.subject,
    html: options.message
  };

  request.post({
    url: url,
    form: mailData
  }, function(err, response, body) {
    if (err || response.statusCode >= 400) {
      return cb(err || JSON.parse(body).message);
    }
    cb(null, JSON.parse(body).message);
  });

};

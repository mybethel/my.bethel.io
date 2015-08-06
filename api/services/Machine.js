exports.create = function(script, dyno) {

  var Heroku = require('heroku-client'),
      heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN }).apps(process.env.HEROKU_APP);

      if (process.env.HEROKU_APP === 'bethel-staging') {
        dyno = 'Free';
      }

      heroku.dynos().create({
        command: './workers/' + script + '.js',
        size: dyno,
      }, function(err, result) {
        if (err) return sails.log.error(err);
        sails.log.info(result);
      });

};

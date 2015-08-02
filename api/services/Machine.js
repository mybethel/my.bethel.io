exports.create = function(script, dyno) {

  var Heroku = require('heroku-client'),
      heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN }).apps(process.env.HEROKU_APP);

      if (process.env.HEROKU_APP === 'bethel-staging') {
        dyno = 'Free';
      }

      heroku.dynos().create({
        command: './workers/' + script + '.js',
        size: dyno,
      }, function(err, dynos) {
        console.error(err);
        console.log(dynos);
      });

};

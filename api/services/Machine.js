exports.create = function(script, dyno, arg) {

  if (!process.env.HEROKU_API_TOKEN || !process.env.HEROKU_APP) {
    sails.log.warn('Heroku not configured: machine executing on main thread.');
    require('../../workers/' + script).run(function(done) {
      sails.log('Machine finished with result:')
      sails.log(done);
    }, arg);
    return;
  }

  var Heroku = require('heroku-client'),
      heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN }).apps(process.env.HEROKU_APP);

  if (process.env.HEROKU_APP === 'bethel-staging') {
    dyno = 'Free';
  }

  heroku.dynos().create({
    command: './workers/_launcher ' + script + ' ' + arg,
    size: dyno,
  }, function(err, result) {
    if (err) return sails.log.error(err);
    sails.log.info(result);
  });

};

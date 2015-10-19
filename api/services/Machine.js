var Heroku = require('heroku-client'),
    herokuClient = new Heroku({ token: process.env.HEROKU_API_TOKEN }).apps(process.env.HEROKU_APP);

exports.create = function(script, dyno, arg) {

  if (!process.env.HEROKU_API_TOKEN || !process.env.HEROKU_APP) {
    sails.log.warn('Heroku not configured: machine executing on main thread.');
    require('../../workers/' + script).run(function(done) {
      if (!done) return sails.log('Machine finished.');
      sails.log('Machine finished with result:')
      sails.log(done);
    }, arg);
    return;
  }

  if (process.env.HEROKU_APP === 'bethel-staging') {
    dyno = 'Free';
  }

  herokuClient.dynos().create({
    command: ['./workers/_launcher ' + script, arg].join(' '),
    size: dyno,
  }, function(err, result) {
    if (err) return sails.log.error(err);
    sails.log.info(result);
  });

};

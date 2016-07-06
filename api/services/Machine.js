const Awaken = require('awaken');
const worker = new Awaken(process.env.HEROKU_API_TOKEN);

exports.create = function(script, dyno, arg) {

  if (process.env.HEROKU_APP === 'bethel-staging') {
    dyno = 'Free';
  }

  worker.run(script, dyno, arg)
    .then(result => {
      sails.log('Machine finished', result);
    })
    .catch(sails.log.error);

};

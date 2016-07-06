const Sails = require('sails');

module.exports = function() {
  console.log(`Booting worker from ${process.cwd()}`);
  return new Promise((resolve, reject) => {
    Sails.load({
      environment: 'development',
      hooks: {
        blueprints: false,
        csrf: false,
        cors: false,
        grunt: false,
        i18n: false,
        request: false,
        responses: false,
        session: false,
        views: false
      },
      log: {
        level: 'verbose'
      }
    }, function(err, sails) {
      if (err || !sails) return reject(err);
      resolve(sails);
    });
  });
};

/**
 * Get Heroku config
 * ==
 * Using the Heroku Toolbelt CLI, return the configuration associated with the
 * production Platform application. This technique is used to provide as
 * convenient as possible setup from clone to installation. It doesn't require
 * any existing settings which would otherwise need to be defined. An existing
 * Heroku Toolbelt installation is required and the user must be logged in with
 * a Heroku account that has access to the Platform dyno.
 * @return {Promise} - Fulfilled with an Object representing the configuration.
 */
module.exports = function(app) {
  const heroku = require('child_process').spawn('heroku', [
    'config', '--json', `--app=${app}`
  ]);

  return new Promise((resolve, reject) => {
    heroku.stdout.on('data', config => {
      if (config.indexOf('Enter your Heroku credentials') !== -1) {
        console.error('You must log in to Heroku Toolbelt first.');
        console.error('Run `heroku login` and enter your credentials.');
        return reject();
      }

      config = JSON.parse(config.toString());
      if (!config) {
        console.error('Unable to get remote configuration from Heroku.');
        console.error('Expected to get JSON response, instead got:');
        console.error(config.toString());
        return reject();
      }

      resolve(config);
    });

    heroku.on('error', () => {
      console.error('The Heroku Toolbelt CLI does not appear to be installed.');
      console.error('Download at: https://toolbelt.heroku.com');
      reject();
    });
  });
};

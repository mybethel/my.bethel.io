/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  connections: {
    mongo: {
      adapter: 'sails-mongo',
      database: 'mybethel',
      host: process.env.MONGO_PRIMARY,
      port: '10300',
      user: 'mybethel-prod',
      password: process.env.MONGO_PASS,
      replSet: {
        servers: [
          {
            host: 'candidate.12.mongolayer.com',
            port: '10300'
          },
          {
            host: 'candidate.13.mongolayer.com',
            port: '10300'
          }
        ]
      }
    }
  },

  models: {
    connection: 'mongo'
  },

  /***************************************************************************
   * Set the log level in production environment to "warn"                   *
   ***************************************************************************/

  log: {
    level: 'warn'
  }

};

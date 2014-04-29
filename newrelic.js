/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name : ['My Bethel'],
  /**
   * Your New Relic license key.
   */
  license_key : '9d0e10116688261625100072f37d79e573e483c8',
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'trace'
  },

  rules : {
    ignore : [
      '^/socket.io/.*'
    ]
  }
};

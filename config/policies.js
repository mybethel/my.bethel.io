/**
 * Policy mappings (ACL)
 *
 * Policies are simply Express middleware functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect just one of its actions.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.policies = {

  // Default policy for all controllers and actions
  // (`true` allows public access)
  '*': ['sessionAuth'],

  user: {
    '*': ['sessionAuth', 'platformStaff'],
    'login': true,
    'new': true,
    'create': true,
    'update': 'sessionAuth',
    'welcome': 'sessionAuth',
    'invite': true,
    'signup': true
  },

  location: {
    all: true,
    map: true,
    ministry: true,
    show: true
  },

  session: {
    create: true
  },

  ministry: {
    update: 'ministryOwned',
    destroy: 'ministryOwned'
  },

  podcast: {
    feed: true,
    embed: true,
    list: true,
    update: 'ministryOwned',
    destroy: 'ministryOwned'
  },

  podcastmedia: {
    download: true,
    stat: true,
    subscribe: true,
    related: true
  },

  staff: {
    '*': ['sessionAuth', 'platformStaff']
  }
};

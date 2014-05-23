/**
 * Services.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    provider: {
      type: 'string'
    },

    user: {
      type: 'string'
    },

    accessToken: {
      type: 'string'
    },

    refreshToken: {
      type: 'string'
    },

    profile: {
      type: 'array'
    },

    ministry: {
      model: 'ministry'
    }

	}

};

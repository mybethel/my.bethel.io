/**
 * Service.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    provider: {
      type: 'string',
      required: true
    },

    accessToken: {
      type: 'string',
      required: true
    },

    refreshToken: {
      type: 'string'
    },

    user: {
      type: 'string'
    },

    link: {
      type: 'string'
    },

    name: {
      type: 'string'
    },

    picture: {
      type: 'string'
    },

    expires: {
      type: 'string'
    },

    ministry: {
      model: 'ministry'
    }

	}

};

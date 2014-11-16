/**
 * Media.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    filename: {
      type: 'string'
    },

    type: {
      type: 'string'
    },

    extension: {
      type: 'string'
    },

    status: {
      type: 'string'
    },

    ministry: {
      model: 'ministry'
    }

	}

};

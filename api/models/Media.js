/**
 * Media.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    description: {
      type: 'text'
    },

    extension: {
      type: 'string'
    },

    filename: {
      type: 'string'
    },

    ministry: {
      model: 'ministry'
    },

    status: {
      type: 'string'
    },

    tags: {
      type: 'array'
    },

    type: {
      type: 'string'
    }

	}

};

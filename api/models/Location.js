/**
 * Location.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    name: {
      type: 'string',
      required: true
    },

    address: {
      type: 'string',
      required: true
    },

    loc: {
      type: 'array',
      required: true
    },

    ministry: {
      model: 'ministry',
      required: true
    }

	}

};

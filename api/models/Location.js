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

    description: {
      type: 'string'
    },

    address: {
      type: 'string',
      required: true
    },

    loc: {
      type: 'array'
    },

    ministry: {
      model: 'ministry',
      required: true
    }

	},

  beforeCreate: function(values, next) {
    delete values.id;

    if (values.latitude && values.longitude) {
      values.loc = [
        values.longitude,
        values.latitude
      ];
    }

    next();
  },

};

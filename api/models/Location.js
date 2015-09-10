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

    default: {
      type: 'boolean'
    },

    active: {
      type: 'boolean'
    },

    description: {
      type: 'string'
    },

    address: {
      type: 'string',
      required: true
    },

    loc: {
      type: 'array' // [ longitude, latitude ]
    },

    times: {
      type: 'string'
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
        parseFloat(values.longitude),
        parseFloat(values.latitude)
      ];
    }

    next();
  },

  beforeUpdate: function(values, next) {
    if (values.latitude && values.longitude) {
      values.loc = [
        parseFloat(values.longitude),
        parseFloat(values.latitude)
      ];
    }

    next();
  }

};

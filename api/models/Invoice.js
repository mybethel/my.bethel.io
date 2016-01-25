/**
* Invoice.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    ministry: {
      model: 'ministry',
      required: true
    },

    type: {
      type: 'string',
      enum: ['podcast', 'encoding']
    },

    units: {
      type: 'integer'
    }

  }
};

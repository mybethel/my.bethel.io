/**
 * Stats.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

	attributes: {

    date: {
      type: 'integer',
      required: true
    },

    count: {
      type: 'integer'
    },

    type: {
      type: 'string',
      required: true
    },

    object: {
      type: 'string',
      required: true,
    }

	}

};

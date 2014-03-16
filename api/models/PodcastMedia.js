/**
 * PodcastMedia.js
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

    date: {
      type: 'date',
    },

    description: {
      type: 'text'
    },

    url: {
      type: 'url'
    },

    size: {
      type: 'integer'
    },

    uuid: {
      type: 'string'
    },

    type: {
      type: 'string'
    },

    reference: {
      type: 'string'
    },

    referenceId: {
      type: 'int'
    },

    podcast: {
      model: 'podcast'
    }

	},

  afterCreate: function(values, next) {
    sails.log('create id: '+values.id);
    PodcastMedia.publishCreate({
      id: values.id,
      date: values.date,
      name: values.name,
      podcast: values.podcast
    });

    next();
  },

  beforeUpdate: function(values, next) {
    if (values.connect) {
      values.reference = values.connect;
      values.referenceId = values.connect.match(/.*\[id:(\d+)\]/)[1];
    }

    next();
  },

};

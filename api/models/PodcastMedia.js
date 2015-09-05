/**
 * PodcastMedia.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

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

    thumbnail: {
      type: 'url'
    },

    duration: {
      type: 'int'
    },

    tags: {
      type: 'array'
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
    if (values.reference) {
      values.reference = values.reference;
      values.referenceId = values.reference.match(/.*\[id:(\d+)\]/)[1];
    }

    if (values.date) {
      values.date = new Date(values.date);
      values.date.setHours(11, 41, 00);
    }

    next();
  },

};

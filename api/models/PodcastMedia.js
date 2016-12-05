/**
 * PodcastMedia.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
const mime = require('mime');

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

    variants: {
      type: 'json'
    },

    podcast: {
      model: 'podcast'
    },

    deleted: {
      type: 'boolean'
    },

    mime() {
      return mime.lookup(this.url.split('?').shift());
    }

	},

  afterCreate: function(values, next) {
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
      values.date.setHours(11, 41, 0);
    }

    next();
  },

};

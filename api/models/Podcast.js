/**
 * Podcast.js
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

    type: {
      type: 'integer',
      required: true
    },

    source: {
      type: 'integer',
      required: true
    },

    sourceKey: {
      type: 'string'
    },

    description: {
      type: 'text'
    },

    tags: {
      type: 'string'
    },

    copyright: {
      type: 'string'
    },

    temporaryImage: {
      type: 'string'
    },

    image: {
      type: 'string'
    },

    ministry: {
      model: 'ministry'
    },

    imageUrl: function(size) {
      if (this.image) {
        return 'http://cdn.bethel.io/' + size + '/' + this.image;
      }
      return 'http://cdn.bethel.io/' + size + '/DefaultPodcaster.png';
    },

	},

  beforeCreate: function(values, next) {
    delete values.id;
    next();
  },

  afterCreate: function(values, next) {
    if (values.temporaryImage) {
      var image = S3Upload.removeTemp('images/podcast', values.temporaryImage, values.id);
      Podcast.update(values.id, {image: image}, function podcastUpdated(err) {
        if (err) console.log(err);
      });
    }

    next();
  },

  beforeUpdate: function(values, next) {
    if (values.temporaryImage) {
      values.image = S3Upload.removeTemp('images/podcast', values.temporaryImage, values.id);
      delete values.temporaryImage;
    }

    next();
  },

};

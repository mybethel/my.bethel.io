/**
 * Podcast.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var request = require('request');

module.exports = {

  schema: true,

	attributes: {

    embedSettings: {
      type: 'json'
    },

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

    sourceMeta: {
      type: 'array'
    },

    service: {
      model: 'service'
    },

    description: {
      type: 'text'
    },

    tags: {
      type: 'array'
    },

    temporaryImage: {
      type: 'string'
    },

    image: {
      type: 'string'
    },

    statistics: {
      type: 'array'
    },

    storage: {
      type: 'integer'
    },

    ministry: {
      model: 'ministry'
    },

    media: {
      collection: 'podcastmedia',
      via: 'podcast'
    },

    import: {
      type: 'array'
    },

    imageUrl: function(size) {
      if (this.image) {
        return 'http://cdn.bethel.io/' + size + '/' + this.image;
      }
      return 'http://cdn.bethel.io/' + size + '/DefaultPodcaster.png';
    },

    lastSync: {
      type: 'date'
    }

	},

  moveThumbnail: function(temporaryImage, id, cb) {
    if (!temporaryImage || !id) return cb();

    S3Upload.removeTemp('images/podcast', temporaryImage, id).then(function (result) {
      request.post({
        url: 'https://api.imgix.com/v2/image/purger',
        auth: {
          username: 'JgesYnARdsp1GzA8aN2Bw5Aa4soB9Ni6',
          password: '',
        },
        json: true,
        body: { 'url': 'http://bethel.imgix.net/images/' + result }
      }, function (err, msg, response) {
        if (err) sails.log.error(err);
        sails.log.info('Purge IMGIX cache:', response);
        cb(result);
      });
    });
  },

  beforeCreate: function(values, next) {
    delete values.id;
    next();
  },

  afterCreate: function(values, next) {
    Podcast.moveThumbnail(values.temporaryImage, values.id, function (thumbnail) {
      if (thumbnail) {
        Podcast.update(values.id, { image: thumbnail }, function (err) {
          if (err) sails.log.error(err);
          Podcast.publishUpdate(values.id);
        });
      }

      if (values.source === 2) {
        Machine.create('vimeoSyncOne', 'Standard-1X', values.id);
      }

      next();
    });
  },

  beforeUpdate: function(values, next) {
    Podcast.moveThumbnail(values.temporaryImage, values.podcastId, function (thumbnail) {
      if (thumbnail) {
        values.image = thumbnail;
        Podcast.publishUpdate(values.podcastId);
      }
      delete values.temporaryImage;
      next();
    });
  },

};

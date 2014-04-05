/**
 * Ministry
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
    name: {
      type: 'string'
    },

    temporaryImage: {
      type: 'string'
    },

    image: {
      type: 'string'
    },

  	users: {
      collection: 'user',
      via: 'ministry'
    },

    podcasts: {
      collection: 'podcast',
      via: 'ministry'
    },

    locations: {
      collection: 'location',
      via: 'ministry'
    }
    
  },

  beforeUpdate: function(values, next) {
    if (values.temporaryImage) {
      values.image = S3Upload.removeTemp('images/ministry', values.temporaryImage, values.id);
      delete values.temporaryImage;
    }

    next();
  },

};

/**
 * Media.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    description: {
      type: 'text'
    },

    duration: {
      type: 'integer'
    },

    extension: {
      type: 'string'
    },

    filename: {
      type: 'string'
    },

    format: {
      type: 'string'
    },

    framerate: {
      type: 'float'
    },

    height: {
      type: 'integer'
    },

    ministry: {
      model: 'ministry'
    },

    status: {
      type: 'string'
    },

    size: {
      type: 'integer'
    },

    tags: {
      type: 'array'
    },

    type: {
      type: 'string'
    },

    video_bitrate: {
      type: 'integer'
    },

    video_codec: {
      type: 'string'
    },

    width: {
      type: 'integer'
    }

	}

};

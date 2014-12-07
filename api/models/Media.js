/**
 * Media.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    audio_bitrate: {
      type: 'integer'
    },

    audio_codec: {
      type: 'string'
    },

    audio_samplerate: {
      type: 'integer'
    },

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

    name: {
      type: 'string'
    },

    ministry: {
      model: 'ministry'
    },

    public: {
      type: 'boolean',
      defaultsTo: true
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

    video_frames: {
      type: 'integer'
    },

    video_t_audio: {
      type: 'string'
    },

    poster_frame: {
      type: 'string'
    },

    poster_frame_custom: {
      type: 'string'
    },

    width: {
      type: 'integer'
    }

	}

};

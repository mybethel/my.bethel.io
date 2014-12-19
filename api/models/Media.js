/**
 * Media.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    audioBitrate: {
      type: 'integer'
    },

    audioCodec: {
      type: 'string'
    },

    audioSampleRate: {
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

    frameRate: {
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

    videoBitrate: {
      type: 'integer'
    },

    videoCodec: {
      type: 'string'
    },

    videoFrames: {
      type: 'integer'
    },

    posterFrame: {
      type: 'string'
    },

    posterFrameCustom: {
      type: 'string'
    },

    transcodeAudio: {
      type: 'string'
    },

    width: {
      type: 'integer'
    }

	}

};

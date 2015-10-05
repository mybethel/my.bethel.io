/**
 * Playlist.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string'
    },

    parent: {
      model: 'playlist'
    },

    podcastAudio: {
      model: 'podcast'
    },

    podcastVideo: {
      model: 'podcast'
    },

    description: {
      type: 'text'
    },

    dateStart: {
      type: 'date'
    },

    dateEnd: {
      type: 'date'
    },

    ministry: {
      model: 'ministry'
    }

  }

};

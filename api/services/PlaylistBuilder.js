var Promise = require('bluebird');

function Playlist(playlist) {
  this.playlist = playlist;
}

//Playlist.prototype.from = 

var playlist = {};

playlist.from = function(playlist) {

  var sources = [];

  return new Promise(function(resolve) {

    if (playlist.podcastAudio) {
      PodcastMedia.find({ podcast: playlist.podcastAudio }).exec(function(err, audioPodcast) {
        playlist.media = {
          audio: audioPodcast
        };
        resolve(playlist);
      });

      return;
    }

    Promise.all(sources).then(function() {
      resolve(playlist);
    });
  });

};

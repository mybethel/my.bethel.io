function Playback(url) {

  this.url = url;

  this.start = function() {
    var media = new MediaItem();
    media.url = this.url;
    media.type = 'video';
    // @todo: Assign other properties such as title and poster image.

    var playlist = new Playlist();
    playlist.push(media);

    var player = new Player();
    player.playlist = playlist;
    player.play();
  };

};

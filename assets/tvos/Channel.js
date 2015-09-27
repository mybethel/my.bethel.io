var Channel = {

  doc: '',
  uuid: null,

  load: function(uuid) {
    this.uuid = uuid;
    var self = this;
    getDocument('mobile/channel/' + uuid, function(template) {
      self.doc = template;
      self.init();
    });
  },

  init: function() {
    var self = this;
    navigationDocument.pushDocument(this.doc);
    this.doc.addEventListener('select', this.select);
  },

  select: function(event) {
    var action = event.target.getAttribute('action');

    if (typeof Channel[action] !== 'function') {
      console.log('Unable to find action: ' + action, Channel[action]);
      return;
    }

    Channel[action](event);
  },

  favorite: function(event) {
    var favorites = localStorage.getItem('favorites');

    if (favorites) {
      favorites = favorites.split(',');
    } else {
      favorites = [];
    }

    var currentFavorite = favorites.indexOf(this.uuid);
    var icon;

    if (currentFavorite === -1) {
      favorites.push(this.uuid);
      icon = 'resource://button-rated';
    } else {
      delete favorites[currentFavorite]
      icon = 'resource://button-rate';
    }

    this.doc.getElementById('favorite-badge').setAttribute('src', icon);

    if (favorites.length > 0) {
      favorites = favorites.join(',');
      localStorage.setItem('favorites', favorites);
    } else {
      localStorage.removeItem('favorites');
    }
  },

  goLive: function(event) {
    var media = new MediaItem();
    media.url = 'http://vevoplaylist-live.hls.adaptive.level3.net/vevo/ch1/appleman.m3u8';
    media.type = 'video';

    var playlist = new Playlist();
    playlist.push(media);

    var player = new Player();
    player.playlist = playlist;
    player.play();
  },

  moreInfo: function(event) {
    Detail.load(Channel.uuid);
  },

  playEpisode: function(event) {
    var media = new MediaItem();
    media.url = event.target.getAttribute('episode');
    media.type = 'video';
    // @todo: Assign other properties such as title and poster image.

    var playlist = new Playlist();
    playlist.push(media);

    var player = new Player();
    player.playlist = playlist;
    player.play();
  }

};

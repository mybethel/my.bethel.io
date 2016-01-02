var Channel = {

  doc: '',
  toolbar: [
    {
      title: 'Watch Live',
      badge: 'resource://button-preview',
      attributes: { action: 'goLive' }
    },
    {
      title: 'Favorite',
      badge: 'resource://button-rate',
      attributes: { action: 'favorite', id: 'favorite-badge' }
    },
    {
      title: 'More Info',
      badge: 'resource://button-more',
      attributes: { action: 'moreInfo' }
    }
  ],
  uuid: null,

  load: function(uuid) {
    this.uuid = uuid;
    var self = this;

    HTTP.json('mobile/channel/' + uuid, function(channel) {
      var template = new Template();
      template.style += `.darkBackgroundColor {
        background-color: ${ channel.ministry.color.channelBackground ? channel.ministry.color.channelBackground : '#292929' };
      }`;
      template.coverImage = `https://images.bethel.io/images/${channel.ministry.coverImage ? channel.ministry.coverImage : 'default_poster.jpg'}?crop=entropy&amp;fit=crop&amp;w=1920&amp;h=360`;
      template.content = `<stackTemplate theme="dark" class="darkBackgroundColor">
      ${template.identityBanner(channel.ministry.name, channel.ministry.subtitle, template.coverImage, { width: 1920, height: 360 }, self.toolbar)}`;

      if (channel.episodes) {
        template.content += template.collectionList([
          {
            title: 'Most Recent',
            content: channel.episodes.map(function(episode) {
              return `<lockup action="playEpisode" episode="${template._encode(episode.url)}">
                <img src="${episode.thumbnail}" width="400" height="225" />
                <title class="showOnHover">${episode.name}</title>
              </lockup>`;
            }).join('')
          },
          {
            title: 'Sermon Series',
            content: channel.series.map(function(series) {
              return `<lockup>
                <img src="https://images.bethel.io/images/${series.image || 'DefaultPodcaster.png'}?crop=center&amp;fit=crop&amp;w=548&amp;h=340" width="548" height="340" class="roundedImageCorners" />
                <title>${series.name}</title>
              </lockup>`;
            }).join('')
          }
        ]);
      }

      template.content += '</stackTemplate>';

      self.doc = template.render();
      self.init();
    });
  },

  init: function() {
    navigationDocument.pushDocument(this.doc);
    this.doc.addEventListener('select', this.select);

    var favorites = localStorage.getItem('favorites');
    if (favorites.indexOf(this.uuid) >= 0) {
      this.doc.getElementById('favorite-badge').firstElementChild.setAttribute('src', 'resource://button-rated');
    }
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
      favorites.splice(currentFavorite, 1);
      icon = 'resource://button-rate';
    }

    this.doc.getElementById('favorite-badge').firstElementChild.setAttribute('src', icon);

    if (favorites.length > 0) {
      favorites = favorites.join(',');
      localStorage.setItem('favorites', favorites);
    } else {
      localStorage.removeItem('favorites');
    }
  },

  goLive: function(event) {
    var media = new Playback('http://vevoplaylist-live.hls.adaptive.level3.net/vevo/ch1/appleman.m3u8');
    media.start();
  },

  moreInfo: function(event) {
    Detail.load(Channel.uuid);
  },

  playEpisode: function(event) {
    var media = new Playback(event.target.getAttribute('episode'));
    media.start();
  }

};

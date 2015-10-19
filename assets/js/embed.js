(function(){
  var VJSButton = videojs.getComponent('Button');

  var DownloadButton = videojs.extend(VJSButton, {
    constructor: function(player, options) {
      VJSButton.call(this, player, options);
      this.controlText('Download');
      this.addClass('vjs-download-button');
    },
    handleClick: function() {
      window.location.href = '/podcastmedia/download/<%= episode.id %>';
    }
  });

  var FeedButton = videojs.extend(VJSButton, {
    feedUrl: '',
    constructor: function(player, options) {
      if (!player.options().feed) return;
      feedUrl = player.options().feed;
      VJSButton.call(this, player, options);
      this.controlText('Subscribe');
      this.addClass('vjs-subscribe-button');
    },
    handleClick: function() {
      window.open(this.feedUrl, '_blank');
    }
  });

  videojs.registerComponent('FeedButton', FeedButton);
  videojs.registerComponent('DownloadButton', DownloadButton);

  videojs.options.flash.swf = 'https://static.bethel.io/libraries/video-js/video-js.swf';
  videojs('embedded', {
    controlBar: {
      fullscreenToggle: false
    }
  }, function() {
    this.controlBar.addChild('DownloadButton');
    this.controlBar.addChild('FeedButton');
  });
})()

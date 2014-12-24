angular.module('Bethel.media').filter('thumbnail', function() {
  return function(media, width, height) {
    if (typeof media === 'undefined' || typeof media.ministry === 'undefined') return '';

    var ministry = (typeof media.ministry.id === 'undefined') ? media.ministry : media.ministry.id,
        prefix = 'https://images.bethel.io/',
        postfix = '?crop=faces&fit=crop&w=' + width + '&h=' + height,
        thumbnail = '';

    if (media.status === 'STATUS_UPLOADING') return prefix + 'images/DefaultPodcaster.png' + postfix;

    switch (media.type) {
      case 'image':
        thumbnail = prefix + 'media/' + ministry + '/' + media.id + '/original.' + media.extension;
        break;

      case 'video':
        if (media.posterFrame) {
          thumbnail = (media.posterFrame === 'custom') ? prefix + media.posterFrameCustom : prefix + 'media/' + ministry + '/' + media.id + '/thumbnails/frame_000' + (Number(media.posterFrame) - 1) + '.jpg';
        }
        else if (media.videoFrames > 1) {
          thumbnail = prefix + 'media/' + ministry + '/' + media.id + '/thumbnails/frame_0001.jpg';
        }
        else {
          thumbnail = prefix + 'images/DefaultPodcaster.png';
        }
        break;

      case 'collection':
        if (media.posterFrame === 'custom') {
          thumbnail = prefix + media.posterFrameCustom;
        }
        else {
          thumbnail = prefix + 'images/DefaultPodcaster.png';
        }
        break;

      default:
        thumbnail = prefix + 'images/DefaultPodcaster.png';

    }

    thumbnail += postfix;

    return thumbnail;
  };
});

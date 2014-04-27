
exports.mimeTypeFromUrl = function(url) {
  if (!url) return;

  if (url.indexOf('.mp3') !== -1) {
    return 'audio/mpeg';
  }

  if (url.indexOf('.mp4') !== -1) {
    return 'video/mp4';
  }
  
  if (url.indexOf('.m4a') !== -1) {
    return 'audio/x-m4a';
  }

  if (url.indexOf('.m4v') !== -1) {
    return 'video/x-m4v';
  }

  if (url.indexOf('.mov') !== -1) {
    return 'video/quicktime';
  }
}

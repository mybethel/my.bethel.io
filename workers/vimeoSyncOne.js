module.exports.run = function(podcast) {
  return VimeoStorageSync.syncOne(podcast);
};

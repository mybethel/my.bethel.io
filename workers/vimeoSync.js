module.exports.run = function(cb) {
  VimeoStorageSync.sync().then(cb).catch(console.error);
};

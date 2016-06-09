const expect = require('expect');
const request = require('supertest');

var fixtures = require('../fixtures');

describe('vimeo sync', () => {

  it('returns videos from Vimeo', done => {
    VimeoStorageSync.getVideos({
      accessToken: '0aaf3681d2716b7d50459f705b83e7cc',
      user: '/users/albertmartin'
    }, 1, {}, function(error, body) {
      expect(body.data.length).toExist();
      done();
    });
  });

  describe('singe page processing', () => {

    it('requires a video to have tags in order to sync', done => {
      VimeoStorageSync.processPage(fixtures.vimeoPage, fixtures.podcast).then(result => {
        console.log(result);
        done();
      });
    });

  });

  describe('single episode processing', () => {

    it('requires a video to have tags in order to sync', done => {
      expect(VimeoStorageSync.processEntry({}, [])).toBe(false);
      done();
    });

    it('ignores videos that are set to private', done => {
      expect(VimeoStorageSync.processEntry({
        tags: ['sermon'],
        privacy: {
          view: 'unlisted',
          embed: 'public',
          download: true,
          add: true,
          comments: 'anybody'
        }
      }, [])).toBe(false);
      done();
    });

    it('requires at least one sync tag to match the podcast and video', done => {
      expect(VimeoStorageSync.processEntry(fixtures.vimeoVideo, ['sermon'])).toBe(false);
      done();
    });

    it('should sync episodes that meet all criteria', done => {
      expect(VimeoStorageSync.processEntry(fixtures.vimeoVideo, fixtures.podcast.sourceMeta)).toBe(true);
      done();
    });

    it('allows multiple sync tags defined in the podcast', done => {
      expect(VimeoStorageSync.processEntry(fixtures.vimeoVideo, ['sermon', 'podcast'])).toBe(true);
      done();
    });

    it('accepts both a string and an array of sync tags', done => {
      expect(VimeoStorageSync.processEntry(fixtures.vimeoVideo, 'podcast')).toBe(true);
      done();
    });

  });

});

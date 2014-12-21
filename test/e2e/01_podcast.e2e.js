var expect = require('expect.js');

describe('Podcasting', function() { 
  
  it('permits user to create new podcasts.', function() {
    browser.get('/#/podcast');

    element(by.css('.btn.btn-success')).getText().then(function (text) { 
      expect(text).to.be('New Podcast');

      element(by.css('.btn.btn-success')).click();
    });

  });

});
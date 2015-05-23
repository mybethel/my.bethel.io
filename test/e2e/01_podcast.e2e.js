var expect = require('expect.js');

describe('Podcasting', function() { 
  
  it('permits user to create new podcasts.', function() {
    browser.get('/#/podcast');

    element(by.css('.btn.btn-success')).getText().then(function (text) { 
      expect(text).to.be('New Podcast');

      element(by.css('.btn.btn-success')).click();
    });

  });

  it('uses a wizard to walk the user through podcast creation.', function() {

    element(by.css('.wizard section.current h1')).getText().then(function (text) {

      expect(text).to.be('Create a new podcast');

      element(by.model('newPodcast.name')).sendKeys('The History of the Verse');
      element(by.css('.wizard section.current .btn-primary')).click();

      element(by.css('.wizard section.current h1')).getText().then(function (text) {
        expect(text).to.be('What type of podcast?');
        element(by.css('.wizard section.current .btn .fa-volume-up')).click();

        element(by.css('.wizard section.current h1')).getText().then(function (text) {
          expect(text).to.be('Choose episode storage');
          element(by.css('.wizard section.current .btn.storage-bethel')).click();

          element(by.css('.wizard section.current h1')).getText().then(function (text) {
            expect(text).to.be('Upload your podcast image');
            element(by.css('.wizard section.current input.btn-primary')).click();

            element(by.css('.wizard section.current p span')).getText().then(function (text) {
              expect(text).to.be('The History of the Verse');
              element(by.css('.wizard section.current input.btn-primary')).click();
            });

          });
        });
      });
    });
  });

});
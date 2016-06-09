describe('Podcasting', function() {

  it('permits user to create new podcasts.', function() {
    browser.get('#/podcast');

    browser.wait(() => element(by.css('button.md-fab')).isPresent());
    expect(element(by.css('button.md-fab')).isPresent()).toBe(true);
    expect(element(by.css('.getting-started')).isPresent()).toBe(true);
    expect(element(by.css('.getting-started h2')).getText()).toBe('Getting Started with Podcasting');
  });

  // @todo: Updated wizard test to include sad paths and validation.
  it('uses a wizard to walk the user through podcast creation.', function() {
    element(by.css('button.md-fab')).click();

    browser.wait(() => element(by.css('md-dialog section.current')).isPresent());
    expect(element(by.css('md-dialog section.current h1')).getText()).toBe('Create a new podcast');
    element(by.model('newPodcast.name')).sendKeys('The History of the Verse');
    element(by.css('md-dialog section.current button.md-primary')).click();

    browser.wait(() => element(by.css('button.type-audio')).isPresent());
    expect(element(by.css('md-dialog section.current h1')).getText()).toBe('What type of podcast?');
    element(by.css('button.type-audio')).click();

    browser.wait(() => element(by.css('button.storage-bethel')).isPresent());
    expect(element(by.css('md-dialog section.current h1')).getText()).toBe('Choose episode storage');
    element(by.css('button.storage-bethel')).click();

    expect(element(by.css('md-dialog section.current h1')).getText()).toBe('Upload your podcast image');
    element(by.css('md-dialog section.current .md-actions button.md-primary')).click();

    expect(element(by.css('.podcast-preview p strong')).getText()).toBe('The History of the Verse');
    element(by.css('md-dialog section.current button.md-primary')).click();
  });

});

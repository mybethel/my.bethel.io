describe('Podcasting', function() { 
  
  it('permits user to create new podcasts.', function() {
    browser.get('#/podcast');

    expect(element(by.css('button.md-fab')).isPresent()).toBe(true);
    expect(element(by.css('.getting-started')).isPresent()).toBe(true);
    expect(element(by.css('.getting-started h2')).getText()).toBe('Getting Started with Podcasting');

    element(by.css('button.md-fab')).click();
  });

  it('uses a wizard to walk the user through podcast creation.', function() {

    expect(element(by.css('md-dialog h1')).getText()).toBe('Create a new podcast');
    // @todo: Updated wizard test based on new Material UI.
    
  });

});
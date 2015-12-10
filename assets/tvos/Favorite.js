var Favorite = {

  favorites: [],

  showAll: function() {
    this.favorites = localStorage.getItem('favorites');
    if (!this.favorites) {
      this.showInstructions();
      return;
    }
    getDocument(`ministry/find?id=${this.favorites}`, this.showFavorites, 'json');
  },

  showInstructions: function() {
    var message = `Click the favorite icon for quick access to your church.
Once you've favorited a church it will appear here.`;

    var template = new Template().alert('Access your favorites here', message).render()
    template.addEventListener('select', function() {
      navigationDocument.dismissModal();
    });

    navigationDocument.presentModal(template);
  },

  showFavorites: function(results) {
    results = JSON.parse(results);

    var section = `<listItemLockup uuid="search">
       <title>Search for a Church</title>
    </listItemLockup>
    ${results.map(function(favorite) { return `<listItemLockup uuid="${favorite.id}">
        <title>${favorite.name}</title>
    </listItemLockup>`; }).join('')}`;

    var related = `<imgDeck>
       <img src="https://images.bethel.io/images/DefaultPodcaster.png" />
       <img src="https://images.bethel.io/images/DefaultPodcaster.png" />
    </imgDeck>`;

    var template = new Template();
    template.title = 'My Favorites';
    template.parade(section, related);
    template = template.render();

    template.addEventListener('select', Favorite.select);
    navigationDocument.pushDocument(template);
  },

  select: function(event) {
    var selectedElement = event.target;
    var uuid = selectedElement.getAttribute('uuid');

    if (uuid == 'search') {
      return SearchScreen.load();
    }

    Channel.load(uuid);
  }

};

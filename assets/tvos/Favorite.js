var Favorite = {

  favorites: [],

  showAll: function() {
    this.favorites = localStorage.getItem('favorites');
    if (!this.favorites) {
      this.showInstructions();
      return;
    }

    this.favorites = this.favorites.split(',');
    this.showFavorites();
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

  showFavorites: function() {

    var section = `<listItemLockup uuid="search">
       <title>Search for a Church</title>
    </listItemLockup>
    ${this.favorites.map(function(favorite) { return `<listItemLockup>
        <title>${favorite}</title>
    </listItemLockup>`; }).join('')}`;

    var related = `<imgDeck>
       <img src="https://images.bethel.io/images/DefaultPodcaster.png" />
       <img src="https://images.bethel.io/images/DefaultPodcaster.png" />
    </imgDeck>`;

    var template = new Template().parade('My Favorites', section, related).render();
    template.addEventListener('select', this.select);
    navigationDocument.pushDocument(template);
  },

  select: function(event) {
    var selectedElement = event.target;
    var uuid = selectedElement.getAttribute('uuid');

    if (uuid == 'search') {
      return SearchScreen.load();
    }
  }

};

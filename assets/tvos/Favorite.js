var Favorite = {

  template: '',

  buildTemplate: function(favorites) {
    var section = `<shelf centered="true">
      <section>
        ${favorites.map(function(favorite) { return `<lockup uuid="${favorite.id}">
          <img src="https://images.bethel.io/images/${ favorite.image ? favorite.image : 'DefaultPodcaster.png' }?crop=center&amp;fit=crop&amp;w=548&amp;h=340" width="548" height="340" class="roundedImageCorners" />
          <title class="showOnHover">${favorite.name}</title>
        </lockup>`; }).join('')}
      </section>
    </shelf>
    <button uuid="search">
      <text>Search for a Church</text>
    </button>`;

    var template = new Template();
    template.title = 'My Favorites';
    template.alertDescriptive(section);
    template = template.render();

    template.addEventListener('appear', Favorite.reload);
    template.addEventListener('select', Favorite.select);

    return template;
  },

  reload: function() {
    if (App.favorites == localStorage.getItem('favorites')) return;
    App.favorites = localStorage.getItem('favorites');
    HTTP.json(`ministry/find?id=${App.favorites}`, function(results) {
      var template = Favorite.buildTemplate(results);
      navigationDocument.replaceDocument(template, Favorite.template);
      Favorite.template = template;
    });
  },

  showAll: function() {
    App.favorites = localStorage.getItem('favorites');
    if (!App.favorites) {
      this.showInstructions();
      return;
    }
    HTTP.json(`ministry/find?id=${App.favorites}`, this.showFavorites);
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
    Favorite.template = Favorite.buildTemplate(results);
    navigationDocument.pushDocument(Favorite.template);
  },

  select: function(event) {
    var selectedElement = event.target;
    var uuid = selectedElement.getAttribute('uuid');

    if (uuid == 'search') {
      if (App.mainScreen == 'search') {
        return navigationDocument.popDocument();
      }
      return SearchScreen.load();
    }

    Channel.load(uuid);
  }

};

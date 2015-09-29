var Favorite = {

  showAll: function() {
    var favorites = localStorage.getItem('favorites');
    if (!favorites) {
      this.showInstructions();
      return;
    }

    // @todo: Show all favorite churches here.
  },

  showInstructions: function() {
    var message = `Click the favorite icon for quick access to your church.
Once you've favorited a church it will appear here.`;

    var template = `<?xml version="1.0" encoding="UTF-8" ?>
      <document>
        <alertTemplate>
          <title>Access your favorites here</title>
          <description>` + message + `</description>
          <button>
            <text>Done</text>
          </button>
        </alertTemplate>
      </document>`

    var parser = new DOMParser();
    template = parser.parseFromString(template, 'application/xml');
    template.addEventListener('select', function() {
      navigationDocument.dismissModal();
    });

    navigationDocument.presentModal(template);
  }

};

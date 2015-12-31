var SearchScreen = {

  doc: '',
  kb: null,

  load: function() {
    var self = this;
    HTTP.getDocument('mobile/tvos', function(template) {
      self.doc = template;
      self.init();
    });
  },

  init: function() {
    var self = this;
    navigationDocument.pushDocument(this.doc);
    this.doc.addEventListener('select', this.select);

    var searchField = this.doc.getElementById('search');
    this.kb = searchField.getFeature('Keyboard');
    this.kb.onTextChange = function() {
      self.search(self);
    }
  },

  search: function(self) {
    var searchText = encodeURI(self.kb.text);
    var resultsArea = self.doc.getElementById('results');

    HTTP.getDocument('mobile/channel?search=' + searchText, function(template) {
      // @todo: Need to add logic to only remove elements that don't exist in
      // the search results and add new entries. Currently this just replaces
      // all the content which produces a rather un-polished flash on-screen.
      resultsArea.parentNode.innerHTML = template;
    }, 'text');
  },

  select: function(event) {
    var selectedElement = event.target;
    var uuid = selectedElement.getAttribute('uuid');

    if (uuid) {
      Channel.load(uuid);
      return;
    }

    var action = event.target.getAttribute('action');

    if (typeof SearchScreen[action] !== 'function') {
      console.log('Unable to find action: ' + action, SearchScreen[action]);
      return;
    }

    SearchScreen[action](event);
  },

  showFavorites: function() {
    if (App.mainScreen == 'favorites') {
      return navigationDocument.popDocument();
    }
    Favorite.showAll();
  },

  submitChurch: function() {
    var submitText = `Tell your church you'd like to see them here! Any church can be listed
for absolutely no cost; we'll even help with the setup process!
Contact us at hello@bethel.io for more details.`;

    var submitTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
      <document>
        <alertTemplate>
          <title>Can't find your church?</title>
          <description>${ submitText }</description>
          <button>
            <text>Done</text>
          </button>
        </alertTemplate>
      </document>`

    var parser = new DOMParser();
    submitTemplate = parser.parseFromString(submitTemplate, 'application/xml');
    submitTemplate.addEventListener('select', function() {
      navigationDocument.dismissModal();
    });

    navigationDocument.presentModal(submitTemplate);
  }

};

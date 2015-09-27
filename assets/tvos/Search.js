var SearchScreen = {

  doc: '',
  kb: null,

  load: function() {
    var self = this;
    getDocument('mobile/tvos', function(template) {
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

    getDocument('mobile/channel?search=' + searchText, function(template) {
      // @todo: Need to add logic to only remove elements that don't exist in
      // the search results and add new entries. Currently this just replaces
      // all the content which produces a rather un-polished flash on-screen.
      resultsArea.parentNode.innerHTML = template;
    }, 'text');
  },

  select: function(event) {
    var selectedElement = event.target;
    var uuid = selectedElement.getAttribute('uuid');

    Channel.load(uuid);
  }

};

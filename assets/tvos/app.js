function getDocument(url, cb) {
  url = 'http://localhost:1337/' + url
  var templateXHR = new XMLHttpRequest();
  templateXHR.responseType = 'document';
  templateXHR.addEventListener('load', function() {
    cb(templateXHR.responseXML);
  }, false);
  templateXHR.open('GET', url, true);
  templateXHR.send();
  return templateXHR;
}

App.onLaunch = function(options) {
  SearchScreen.load();
}

App.onExit = function() {
  console.log('App finished');
}

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
    navigationDocument.pushDocument(this.doc);

    var searchField = this.doc.getElementById('search');
    this.kb = searchField.getFeature('Keyboard');
    this.kb.onTextChange = this.search();
  },

  search: function() {
    var searchText = this.kb.text;
    var resultsArea = this.doc.getElementById('results');
  }

};

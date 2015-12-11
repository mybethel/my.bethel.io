var HTTP = {

  getDocument: function(url, cb, type) {
    type = type || 'document';
    var templateXHR = new XMLHttpRequest();
    templateXHR.responseType = type;
    templateXHR.addEventListener('load', function() {
      var response = (type == 'document') ? templateXHR.responseXML : templateXHR.responseText
      cb(response);
    }, false);
    templateXHR.open('GET', App.baseUrl + url, true);
    templateXHR.send();
    return templateXHR;
  },

  json: function(url, cb) {
    this.getDocument(url, function(results) {
      results = JSON.parse(results);
      cb(results);
    }, 'json');
  }

};

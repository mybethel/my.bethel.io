function getDocument(url, cb, type) {
  type = type || 'document';
  url = 'http://localhost:1337/' + url
  var templateXHR = new XMLHttpRequest();
  templateXHR.responseType = type;
  templateXHR.addEventListener('load', function() {
    var response = (type == 'document') ? templateXHR.responseXML : templateXHR.responseText
    cb(response);
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
function getDocument(url, cb, type) {
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
}

App.checkForUpdates = function() {
  getDocument(`mobile/status`, function(result) {
    result = JSON.parse(result);
    if (!result || !result.tvos) return;

    console.log(App.version, result.tvos);

    if (App.version && App.version < result.tvos) {
      console.log('New release detected...');
      App.reload();
    }

    App.version = result.tvos;
  }, 'json');
};

App.onLaunch = function(options) {

  var jsFiles = [
    `${options.BASEURL}tvos/Channel.js`,
    `${options.BASEURL}tvos/Detail.js`,
    `${options.BASEURL}tvos/Favorite.js`,
    `${options.BASEURL}tvos/Playback.js`,
    `${options.BASEURL}tvos/Search.js`,
    `${options.BASEURL}tvos/Template.js`
  ];

  App.mainScreen = 'favorites';
  App.baseUrl = options.BASEURL;

  App.checkForUpdates();

  evaluateScripts(jsFiles, function(success) {
    App.favorites = localStorage.getItem('favorites');
    if (!App.favorites) {
      App.mainScreen = 'search';
      SearchScreen.load();
      return;
    }
    Favorite.showAll();
  });

};

App.onResume = function(options) {
  App.checkForUpdates();
};

App.onExit = function() {
  console.log('App finished');
}

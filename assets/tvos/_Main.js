App.checkForUpdates = function() {
  HTTP.json('mobile/status', function(result) {
    if (!result || !result.tvos) return;

    console.log(App.version, result.tvos);

    if (App.version && App.version < result.tvos) {
      console.log('New release detected...');
      App.reload();
    }

    App.version = result.tvos;
  });
};

App.onLaunch = function(options) {

  App.mainScreen = 'favorites';
  App.baseUrl = `${options.BASEURL}`;

  var jsFiles = [
    'Channel',
    'Detail',
    'Favorite',
    'HTTP',
    'Playback',
    'Search',
    'Template'
  ].map(function(item) { return `${App.baseUrl}tvos/${item}.js` });

  evaluateScripts(jsFiles, function(success) {

    App.favorites = localStorage.getItem('favorites');
    App.checkForUpdates();

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
};

/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */


(function (io) {

  // as soon as this file is loaded, connect automatically, 
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      log('New comet message received :: ', message);
      //////////////////////////////////////////////////////

    });

    // Get the current path minus any trailing slash.
    var page = document.location.pathname;
    page = page.replace(/(\/)$/, '');

    socket.get('/podcastmedia/subscribe');

    socket.on('podcastmedia', function messageReceived(message) {
      log('New comet message received :: ', message);

      switch (message.verb) {

        case 'updated':
          var mediaRow = $("tr[data-id='" + message.id + "']");

          if (mediaRow) {
            $('h4', mediaRow).text(message.data.name);
            $('small', mediaRow).text(new Date(message.data.date).toDateString());

            if (message.data.name && message.data.description && message.data.url) {
              mediaRow.removeClass('warning');
            } else {
              mediaRow.addClass('warning');
            }
          }

          break;

        case 'created':
          var podcastMediaListing = $('table.podcast-media tbody');

          if (podcastMediaListing) {
            $.get('/podcastmedia/row/' + message.data.id, function(data) {
              podcastMediaListing.prepend(data);
            });
          }

          break;

      }

    });


    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to 
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
        'Socket is now connected and globally accessible as `socket`.\n' + 
        'e.g. to send a GET request to Sails, try \n' + 
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


  });


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }
  

})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);

jQuery(document).ready(function($) {
  if ($('#file-upload').length) {
    $('#file-upload').fileupload({
      url: $(this).attr('action'),
      type: 'POST',
      datatype: 'xml',
      autoUpload: true,
      add: function (e, data) {
        $('.progress').show();
        $('.fileinput-button').hide();
        data.submit();
      },
      fail: function(e, data) {
        $('.progress').hide();
        $('.fileinput-button').show();
      },
      progressall: function (e, data) {
        var progress = data.loaded / data.total * 100;
        if (progress >= 5) {
          $('.progress').removeClass('progress-striped active');
          $('.progress .progress-bar').css('width', progress + '%');
          $('.progress .progress-bar').text(Math.round(progress) + '%'); 
        }
      },
      done: function (e, data) {
        $('.progress').hide();
        $('.fileinput-button').show();

        if (data.files && data.files[0]) {
          if ($('#upload-widget img.thumbnail-sidebar').length) {
            var temporaryImageLocation = $('#upload-widget').data('temp-location').replace('images/', '');
            $('#upload-widget').removeClass('dropzone');
            $('#upload-widget img.thumbnail-sidebar').attr('src', 'http://bethel.api.pixtulate.com/' + temporaryImageLocation + '/' + data.files[0].name + '?w=400&height=400');
            $('#upload-widget img.thumbnail-sidebar').fadeIn();
            $('.fileinput-button').removeClass('btn-success')
            $('.fileinput-button').addClass('btn-default');
            $('.fileinput-button span').text('Replace existing image...');
            $('input[name=temporaryImage]').attr('value', data.files[0].name);
          } else {
            $.get('/podcastmedia/refresh');
          }
        }
      }
    });
  }
});
jQuery(document).ready(function($) {
  $('button.sidebar-submit').click(function() {
    $('form.sidebar-form').submit();
  });

  $('table.podcast-media').on('click', '.media-edit-button', function() {
    if ($(this).text() == 'Cancel') {
      var episodeTitle = $(this).closest('tr').find('h4');
      episodeTitle.text(episodeTitle.attr('value'));
      $(this).text('Edit');
      $(this).closest('tr').next().find('form').slideToggle();
    } else {
      $(this).closest('tr').next().find('td').load('/podcastmedia/edit/' + $(this).data('source'), function() {
        var podcastForm = $(this).find('form');
        podcastForm.slideToggle();
        $(this).find('.episode-date').datepicker({
          format: 'm-d-yyyy',
        });
        $('.podcast-media-edit #episodeTitle').keyup(updateMediaBinding);
        $('.podcast-media-edit #episodeTitle').change(updateMediaBinding);
        podcastForm.ajaxForm(function() {
          podcastForm.slideToggle();
          podcastForm.closest('tr').prev().find('.media-edit-button').text('Edit');
        });
      });
      $(this).text('Cancel');
    }
  });

  var updateMediaBinding = function(element) {
    var binding = '.' + $(this).attr('binding') + ' h4';

    if ($(this).val()) {
      $(binding).text($(this).val());
    } else {
      $(binding).text($(binding).attr('value'));
    }
  }

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
          $('#upload-widget').removeClass('dropzone');
          $('#upload-widget img.thumbnail-sidebar').attr('src', 'http://cdn.bethel.io/400x400/podcast/tmp/' + data.files[0].name);
          $('#upload-widget img.thumbnail-sidebar').fadeIn();
          $('.fileinput-button').removeClass('btn-success')
          $('.fileinput-button').addClass('btn-default');
          $('.fileinput-button span').text('Replace existing image...');
          $('input[name=temporaryImage]').attr('value', data.files[0].name);
        }
      }
    }
  });
});
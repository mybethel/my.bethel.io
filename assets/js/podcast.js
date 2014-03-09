jQuery(document).ready(function($) {
  $('button.sidebar-submit').click(function() {
    $('form.sidebar-form').submit();
  });

  $('.media-edit-button').click(function() {
    ($(this).text() == 'Edit') ? $(this).text('Cancel') : $(this).text('Edit');
    $(this).closest('tr').next().find('form').slideToggle()
    $(this).closest('tr').next().find('.episode-date').datepicker({
      format: 'm-d-yyyy',
    });
  });

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
        $('#upload-widget').removeClass('dropzone');
        $('#upload-widget img.thumbnail-sidebar').attr('src', 'http://cdn.bethel.io/400x400/podcast/tmp/' + data.files[0].name);
        $('#upload-widget img.thumbnail-sidebar').fadeIn();
        $('.fileinput-button').removeClass('btn-success')
        $('.fileinput-button').addClass('btn-default');
        $('.fileinput-button span').text('Replace existing image...');
        $('input[name=temporaryImage]').attr('value', data.files[0].name);
      }
    }
  });
});
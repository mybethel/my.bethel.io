$(document).ready(function(){
  $(document).on('click', 'a', function (e) {
    if ($(this).data('link') === 'popover') {
      var url = $(this).attr('href');
      $.ajax({
        type: 'GET',
        url: url
      }).done(function (data) {
        $('#popover').html(data);
        $('#popover').modal();
      });
      e.preventDefault();
    }
  });
});

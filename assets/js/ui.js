String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

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

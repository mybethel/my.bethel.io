$(document).ready(function(){
  $.validator.setDefaults({
    highlight: function(element) {
      $(element).parent().addClass('has-error');
    },
    unhighlight: function(element) {
      $(element).closest('.form-item').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
  });

  $('.user-form.signup').validate({
    rules: {
      email: {
        required: true,
        email: true
      },
      pass: {
        minlength: 6,
        required: true
      }
    },
    success: function(element) {
      element.addClass('valid');
    }
  });

  $('#welcome-carousel').bind('slid.bs.carousel', function (e) {
    if($('.carousel-inner .item:first').hasClass('active')) {
      $(this).children('.left.carousel-control').fadeOut();
      $(this).children('.right.carousel-control').fadeIn();
    }
    else if($('.carousel-inner .item:last').hasClass('active')) {
      $(this).children('.carousel-control').fadeOut();
    }
    else {
      $(this).children('.carousel-control').fadeIn();
    }
  });
});

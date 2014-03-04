$(document).ready(function(){
  $('.media-edit-button').click(function() {
    ($(this).text() == 'Edit') ? $(this).text('Cancel') : $(this).text('Edit');
    $(this).closest('tr').next().find('form').slideToggle()
    $(this).closest('tr').next().find('.episode-date').datepicker({
      format: 'm-d-yyyy',
    });
  })
});

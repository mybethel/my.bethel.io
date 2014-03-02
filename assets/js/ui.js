$(document).ready(function(){
  $('#nav-toggle').click(function (e){
    $('body').toggleClass('nav-collapsed');
    e.preventDefault();
  });
});

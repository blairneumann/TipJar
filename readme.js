/* global markdown */

$(document).ready(function() {
  $.get('README.md', function(data, status) {
    $('#readme')[0].innerHTML = markdown.toHTML(data);
  });
});

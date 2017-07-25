/* eslint no-throw-literal: "off" */

var w3cjs = require('w3cjs');

describe('HTML validation', function() {
  it('index page should have no HTML errors', function(done) {
    w3cjs.validate({
      file: 'index.html',
      callback: function(error, res) {
        if (res && res.messages.length > 0 ) {
          throw { error: 'html errors have been found', results: res };
        }
        done();
      },
    });
  });

  it('error page should have no HTML errors', function(done) {
    w3cjs.validate({
      file: 'error.html',
      callback: function(error, res) {
        if (res && res.messages.length > 0 ) {
          throw { error: 'html errors have been found', results: res };
        }
        done();
      },
    });
  });
});

/* eslint no-throw-literal: "off" */
/* eslint-env node */

var w3cjs = require('w3cjs');

describe('HTML validation', function() {
  it('index.html should have no validation errors', function(done) {
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

  it('error.html should have no validation errors', function(done) {
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

  it('testrunner.html should have no validation errors', function(done) {
    w3cjs.validate({
      file: 'testrunner.html',
      callback: function(error, res) {
        if (res && res.messages.length > 0 ) {
          throw { error: 'html errors have been found', results: res };
        }
        done();
      },
    });
  });
});

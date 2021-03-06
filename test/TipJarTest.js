/* eslint no-undef: "off" */

var assert = chai.assert;

function isPositiveInteger(name, value) {
  describe('Positive integer: '+ name, function() {
    it('should be a positive integer', function() {
      assert.isNumber(value, 'is a number');
      assert.isAbove(value, 0, 'is positive');
      assert.strictEqual(value - Math.floor(value), 0,
        'is an integer');
    });
  });
}

isPositiveInteger('maxCharCount', maxCharCount);
isPositiveInteger('alertDuration', alertDuration);

describe('listOfPlaceholderTips', function() {
  it('should be a non-trivial array of strings', function() {
    assert.isArray(listOfPlaceholderTips, 'is an array');
    assert.isAbove(listOfPlaceholderTips.length, 0,
      'is a non-trivial array');

    for (var idx = 0; idx < listOfPlaceholderTips.length; ++idx) {
      assert.isString(listOfPlaceholderTips[idx], 'tip is a string');
    }
  });
});

var alertStringParams = ['$class$', '$content$'];

describe('baseAlertString', function() {
  it('should be a non-trivial string', function() {
    assert.isString(baseAlertString, 'is a string');
    assert.isAbove(baseAlertString.length, 0, 'is a non-trivial string');
  });

  it('should be parameterized', function() {
    for (var idx = 0; idx < alertStringParams.length; ++idx) {
      assert.isAbove(baseAlertString.indexOf(alertStringParams[idx]), -1,
        'contains parameter '+ alertStringParams[idx]);
    }
  });
});

describe('buildAlertString', function() {
  var alert = buildAlertString('test-class', 'test-content');

  it('should return a non-trivial string', function() {
    assert.isString(alert, 'returns a string');
    assert.isAbove(alert.length, 0, 'returns a non-trivial string');
  });

  it('should have its parameters replaced', function() {
    for (var idx = 0; idx < alertStringParams.length; ++idx) {
      assert.strictEqual(alert.indexOf(alertStringParams[idx]), -1,
        'parameter is replaced: '+ alertStringParams[idx]);
    }
  });
});

function isHtmlElement(name, $element) {
  describe('HTML element: '+ name, function() {
    it('should exist', function() {
      assert.exists($element[0], 'exists');
    });

    it('should be HTML', function() {
      assert.isString($element[0].outerHTML, 'outer HTML is string');
    });
  });
}

function isAlertElement(name, $element) {
  describe('Alert Element: '+ name, function() {
    isHtmlElement(name, $element);

    it('should contain inner text', function() {
      assert.isString($element[0].innerText, 'inner text is string');
      assert.isString($element[0].innerText.trim(),
        'inner text is non-trivial string');
    });

    it('should have its parameters replaced', function() {
      for (var idx = 0; idx < alertStringParams.length; ++idx) {
        assert.strictEqual($element[0].innerHTML
          .indexOf(alertStringParams[idx]), -1,
          'parameter is replaced: '+ alertStringParams[idx]);
      }
    });
  });
}

isAlertElement('Success', $alertSuccess);
isAlertElement('Error', $alertError);

onReady();
$(document).ready(function() { });

isHtmlElement('$body', $body);
isHtmlElement('$input', $input);
isHtmlElement('$progressBar', $progressBar);
isHtmlElement('$charCount', $charCount);

describe('Input field is ready', function() {
  it('maxlength should equal maxCharCount', function() {
    assert.strictEqual($input.attr('maxlength'), maxCharCount.toString(),
      'maxlength equals maxCharCount');
  });
});

describe('onResize', function() {
  it('header and footer should be invisible when small', function() {
    onResize(null, 50);
    assert.strictEqual($header.css('visibility'), 'hidden');
    assert.strictEqual($footer.css('visibility'), 'hidden');
  });

  it('header and footer should be visible when large', function() {
    onResize(null, 500);
    assert.strictEqual($header.css('visibility'), 'visible');
    assert.strictEqual($footer.css('visibility'), 'visible');
  });
});

describe('doResetInput', function() {
  var focus;

  before(function() {
    focus = sinon.stub($.fn, 'focus');
    doResetInput();
  });

  it('should be enabled', function() {
    assert.notExists($input.attr('disabled'),
      'disabled attribute is not present');
  });

  it('should have placeholder text', function() {
    var placeholder = $input.attr('placeholder');
    assert.isString(placeholder, 'placeholder is string');
    assert.isAbove(placeholder.length, 0, 'placeholder text is non-trivial');
  });

  it('should be empty', function() {
    assert.strictEqual($input.val(), '', 'value is empty');
  });

  it('should have updated the character count', function() {
    var count = $charCount[0].innerText;
    assert.isString(count, 'character count is string');
    assert.strictEqual(count.trim(), maxCharCount.toString(),
      'character count is the maximum');
  });

  it('should have focus', function() {
    assert.isTrue(focus.calledOnce, 'focus() was called once');
  });
});

describe('doRandomTipPlaceholder', function() {
  before(function() {
    doRandomTipPlaceholder();
  });

  it('should have a tip placeholder', function() {
    var placeholder = $input.attr('placeholder');
    assert.isString(placeholder, 'placeholder is string');
    assert.isAbove(placeholder.length, 0, 'placeholder text is non-trivial');
  });

  it('should be random', function() {
    var isRandom = false;
    var tries = 100;

    var placeholder = $input.attr('placeholder');
    for (var idx = 0; idx < tries; ++idx) {
      doRandomTipPlaceholder();
      if ($input.attr('placeholder') != placeholder) {
        isRandom = true;
        break;
      }
    }

    assert.isTrue(isRandom, 'placeholder text is random');
  });
});

describe('doCharCount', function() {
  beforeEach(function() {
    doResetInput();
    doCharCount();
  });

  it('should equal the maximum when input is empty', function() {
    var count = $charCount[0].innerText;
    assert.isString(count, 'character count is string');
    assert.strictEqual(count.trim(), maxCharCount.toString(),
      'character count is the maximum');
    assert.strictEqual(count, maxCharCount.toString(),
      'character count is not padded');
  });

  it('should update as input is added, up to the maximum, changing color',
    function() {
      var input = '';
      var originalColor = $charCount.css('color');

      var count;
      for (var idx = 1; idx < maxCharCount; ++idx) {
        $input.val(input += 'x');
        doCharCount();
        count = parseInt($charCount[0].innerText, 10);

        assert.strictEqual(count, maxCharCount - idx,
          'character count is accurate');
      }

      assert.notEqual($charCount.css('color'), originalColor,
        'color is updated');
  });
});

describe('doProgressBar', function() {
  it('should update from 0 to 100%', function() {
    for (var width = 0; width < 100; ++width) {
      doProgressBar(width);
      assert.strictEqual($progressBar.css('width'), width + '%',
        'width css is updated');
      assert.strictEqual($progressBar.width(), width,
        '.width() method is updated');
    }
  });
});

describe('xhr', function() {
  var myXhr;

  before(function() {
    doProgressBar(0);
    doResetInput();
    $input.val('test xhr');

    myXhr = sinon.useFakeXMLHttpRequest();

    myXhr.requests = [];
    myXhr.onCreate = function(request) {
      xhr(request);
      myXhr.requests.push(request);
    };
  });

  after(function() {
    myXhr.restore();
  });

  it('should drive progress bar from 0 to 100%', function() {
    assert.strictEqual($progressBar.css('width'), '0%', 'progress is zero');

    assert.strictEqual(myXhr.requests.length, 0, 'zero requests');
    doTipJar();
    assert.strictEqual(myXhr.requests.length, 1, 'one request');

    myXhr.requests[0].respond(200, { }, '');
    assert.strictEqual($progressBar.css('width'), '100%', 'progress is 100%');
  });
});

function testShowAlert(name, $alert, className) {
  describe('doShowAlert: '+ name, function() {
    before(function() {
      doShowAlert($alert);
    });

    it('should show an alert fading in and out', function(done) {
      this.timeout(this.timeout() + alertDuration);
      this.slow(this.slow() + alertDuration);

      var opacities = [];

      var count = 0;
      var resolution = 100;

      var interval = setInterval(function() {
        opacities.push(parseFloat($alert.css('opacity')));

        if (++count >= resolution) {
          clearInterval(interval);

          var idx;
          for (idx = 1; idx < resolution / 2; ++idx) {
            if (1 != opacities[idx]) {
              assert.isAtLeast(opacities[idx], opacities[idx - 1], 'going up');
            }
          }
          for (true; idx < resolution; ++idx) {
            if (1 != opacities[idx]) {
              assert.isAtMost(opacities[idx], opacities[idx - 1], 'going down');
            }
          }

          done();
        }
      }, alertDuration / resolution);
    });

    it('should detach the alert after showing it', function() {
      assert.isUndefined($body.innerHTML, 'alert detached from page body');
    });
  });
}


testShowAlert('Success', $alertSuccess, 'alert-success');
testShowAlert('Error', $alertError, 'alert-error');

describe('doTipJar empty', function() {
  var xhr;

  before(function() {
    doResetInput();
    xhr = sinon.useFakeXMLHttpRequest();
    doTipJar();
  });

  after(function() {
    xhr.restore();
  });

  it('should bail if no input is provided', function() {
    assert.strictEqual($input.val(), '', 'input is empty');
    assert.isUndefined($input.attr('disabled'), 'input is enabled');
  });
});

describe('doTipJar full', function() {
  var xhr;

  before(function() {
    doResetInput();
    $input.val('doTipJar full');

    xhr = sinon.useFakeXMLHttpRequest();
    xhr.requests = [];
    xhr.onCreate = function(request) {
      xhr.requests.push(request);
    };

    doTipJar();
  });

  after(function() {
    xhr.restore();
  });

  it('should disable input', function() {
    assert.strictEqual($input.attr('disabled'), 'disabled',
      'input is disabled');
  });

  it('should set the progress bar to non-zero', function() {
    assert.isAbove($progressBar.width(), 0,
      '.width() is above zero');
  });

  it('should post to a web service async', function() {
    assert.strictEqual(xhr.requests.length, 1, 'one request');
    assert.strictEqual(xhr.requests[0].method, 'POST', 'is a POST request');
    assert.isTrue(xhr.requests[0].async, 'is async');
  });
});

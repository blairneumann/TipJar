/*
 * Note: PhantomJS is being used to run these tests from the command line, and
 * PhantomJS doesn't support ES6 features yet, so this is implemented to ES5.
 * For example, using 'var' where 'let' might make more sense.
 */ 

var assert = chai.assert;

describe('maxCharCount', function () {
  it('should be a positive integer', function () {
    assert.isNumber(maxCharCount, 'is a number');
    assert.isAbove(maxCharCount, 0, 'is positive');
    assert.strictEqual(maxCharCount - Math.floor(maxCharCount), 0, 'is an integer');
  });
});

describe('listOfPlaceholderTips', function () {
  it('should be a non-trivial array of strings', function () {
    assert.isArray(listOfPlaceholderTips, 'is an array');
    assert.isAbove(listOfPlaceholderTips.length, 0, 'is a non-trivial array');
    for (var idx = 0; idx < listOfPlaceholderTips.length; ++idx) {
      assert.isString(listOfPlaceholderTips[idx], 'tip is a string');
    }
  });
});

var alertStringParams = ['$class$', '$content$'];

describe('baseAlertString', function () {
  it('should be a non-trivial string', function () {
    assert.isString(baseAlertString, 'is a string');
    assert.isAbove(baseAlertString.length, 0, 'is a non-trivial string');
  });
  it('should be parameterized', function () {
    for (var idx = 0; idx < alertStringParams.length; ++idx) {
      assert.isAbove(baseAlertString.indexOf(alertStringParams[idx]), -1,
        'contains parameter '+ alertStringParams[idx]);
    }
  });
});

describe('buildAlertString', function () {
  var alert = buildAlertString('test-class', 'test-content');

  it('should return a non-trivial string', function () {
    assert.isString(alert, 'returns a string');
    assert.isAbove(alert.length, 0, 'returns a non-trivial string');
  });
  it('should have its parameters replaced', function () {
    for (var idx = 0; idx < alertStringParams.length; ++idx) {
      assert.strictEqual(alert.indexOf(alertStringParams[idx]), -1,
        'parameter is replaced: '+ alertStringParams[idx]);
    }
  });
});

function testElement (name, element) {
  it(name +' should exist', function () {
    assert.exists(element, 'exists');
  });
  it(name +' should be HTML', function () {
    assert.isString(element.innerHTML, 'inner HTML is string');
  });  
}

function testAlertElement (name, element) {
  describe('Alert Element: '+ name, function () {
    testElement(name, element);
    it('should contain inner text', function () {
      assert.isString(element.innerText, 'inner text is string');
      assert.isString(element.innerText.trim(), 'inner text is non-trivial string');
    });
    it('should have its parameters replaced', function () {
      for (var idx = 0; idx < alertStringParams.length; ++idx) {
        assert.strictEqual(element.innerHTML.indexOf(alertStringParams[idx]), -1,
          'parameter is replaced: '+ alertStringParams[idx]);
      }
    });
  });
}

testAlertElement('Success', $alertSuccess[0]);
testAlertElement('Error', $alertError[0]);

onReady();

describe('onReady', function () {
  testElement("$body", $body[0]);
  testElement("$input", $input[0]);
  testElement("$progressBar", $progressBar[0]);
  testElement("$charCount", $charCount[0]);
});

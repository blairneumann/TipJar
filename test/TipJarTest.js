var assert = chai.assert;

describe('TipJar', function() {
  it('should have a Success alert element', function () {
    assert.exists($alertSuccess, '$alertSuccess exists');
  });

  it('should have an Error alert element', function () {
    assert.exists($alertError, '$alertError exists');
  });
});
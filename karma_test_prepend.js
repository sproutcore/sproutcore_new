
  window.module = QUnit.module;
  window.test = QUnit.test;
  window.equals = QUnit.assert.equal.bind(QUnit.assert);
  window.same = QUnit.assert.deepEqual;
  window.ok = QUnit.assert.ok;
  window.assert = QUnit.assert;
  QUnit.config.autostart = false;

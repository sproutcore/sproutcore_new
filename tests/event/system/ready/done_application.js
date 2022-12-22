
import { SC, GLOBAL } from '../../../../core/core.js';

let realMainFunction, realApplicationMode, timesMainCalled = 0;

GLOBAL.main = function() {
  timesMainCalled += 1;
};

module("onReady.done for App mode", {

});

test("When the application is done loading in application mode", function (assert) {
  const cb = assert.async();
  SC.mode = "APP_MODE";
  SC.onReady.done().then(r => {
    assert.equal(timesMainCalled, 1, "main should have been called");
    cb();
  })

});

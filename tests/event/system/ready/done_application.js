
import { SC, GLOBAL } from '../../../../core/core.js';

let realMainFunction, realApplicationMode, appTimesMainCalled = 0;

GLOBAL.main = function() {
  appTimesMainCalled += 1;
};

module("onReady.done for App mode", {

});

test("When the application is done loading in application mode", function (assert) {
  const cb = assert.async();
  SC.mode = "APP_MODE";
  SC.onReady.done().then(r => {
    assert.equal(appTimesMainCalled, 1, "main should have been called");
    cb();
  })

});

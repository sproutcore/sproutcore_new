// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC, GLOBAL } from '../../../../core/core.js';

let realMainFunction, realApplicationMode, timesMainCalled;
module("onReady.done for Test mode", {
  beforeEach: function() {
    timesMainCalled = 0;

    realMainFunction = GLOBAL.main;
    GLOBAL.main = function() {
      timesMainCalled += 1;
    };

    realApplicationMode = SC.mode;
  },

  afterEach: function() {
    GLOBAL.main = realMainFunction;
    SC.mode = realApplicationMode;
    SC.isReady = false;
  }
});

test("When the application is done loading in test mode", function (assert) {
  const cb = assert.async();
  SC.mode = "TEST_MODE";
  SC.onReady.done().then(r => {
    assert.equal(timesMainCalled, 0, "main should not have been called");
    cb();
  });

});

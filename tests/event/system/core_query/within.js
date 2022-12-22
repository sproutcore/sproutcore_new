// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// CoreQuery Tests
// ========================================================================

import "../../../../event/event.js";

// This file tests additions to CoreQuery.  These should function even if you use
// jQuery
module("CoreQuery.within() && within()");

test("should return if passed RAW element that is child", function (assert) {
  var cq = $('<div class="root">\
    <div class="middle">\
      <div class="child1"></div>\
      <div class="child2"></div>\
    </div>\
  </div>') ;

  var child = cq.find('.child1');
  assert.equal(cq.within(child.get(0)), true, "cq.within(DOMElement) = true") ;

  var notChild = $('<div class="not-child"></div>') ;
  assert.equal(cq.within(notChild.get(0)), false, "cq.hadChild(DOMElement) = false");
  child = notChild = cq = null ;
}) ;

test("should return if passed CQ with element that is child", function (assert) {
  var cq = $('<div class="root">\
    <div class="middle">\
      <div class="child1"></div>\
      <div class="child2"></div>\
    </div>\
  </div>') ;

  var child = cq.find('.child1');
  assert.equal(cq.within(child), true, "cq.within(DOMElement) = true") ;

  var notChild = $('<div class="not-child"></div>') ;
  assert.equal(cq.within(notChild), false, "cq.hadChild(DOMElement) = false");
  child = notChild = cq = null ;
}) ;

test("should work if matched set has multiple element", function (assert) {
  var cq = $('<div class="wrapper">\
    <div class="root"></div>\
    <div class="root"></div>\
    <div class="root">\
      <div class="middle">\
        <div class="child1"></div>\
        <div class="child2"></div>\
      </div>\
    </div>\
  </div>').find('.root') ;
  assert.equal(cq.length, 3, "should have three element in matched set");

  var child = cq.find('.child1');
  assert.equal(cq.within(child), true, "cq.within(DOMElement) = true") ;

  var notChild = $('<div class="not-child"></div>') ;
  assert.equal(cq.within(notChild), false, "cq.hadChild(DOMElement) = false");
  child = notChild = cq = null ;
}) ;

test("should return true if matching self", function (assert) {
  var cq = $('<div></div>');
  assert.equal(cq.within(cq), true, "should not match");
});

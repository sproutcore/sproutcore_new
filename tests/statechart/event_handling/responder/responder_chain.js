// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart */


import { Async, Statechart, State, EmptyState, StatechartManager } from '../../../../statechart/statechart.js';
import { MainPane, View } from '../../../../view/view.js';

var pane, viewA, viewB, stateA, stateB, responder = null;

module("Statechart: Responder Chain Tests", {
  beforeEach: function() {
    pane = MainPane.create({
      
      childViews: 'viewA'.w(),
      
      viewA: View.extend({
        
        childViews: 'viewB'.w(),
        
        viewB: View.extend(StatechartManager, {

          initialState: 'a',
          returnValue: false,

          a: State.design({
            mouseDown: function(evt) {
              responder = this;
              this.gotoState('b');
            },
            
            click: function(evt) {
              responder = this;
              return false;
            }
          }),

          b: State.design({
            mouseUp: function(evt) {
              responder = this;
              this.gotoState('a');
            }

          }),
          
          keyUp: function(evt) { 
            responder = this;
            return this.get('returnValue');
          },
          
          toString: function() { return "view B"; }

        }),
        
        keyUp: function(evt) { 
          console.log('%@: keyUp invoked'.fmt(this));
          responder = this;
        },
        
        keyDown: function(evt) { 
          responder = this;
        },
        
        click: function(evt) {
          responder = this;
        },
        
        toString: function() { return "view A"; }
        
      })
      
    });
    
    viewA = pane.get('viewA');
    viewB = viewA.get('viewB');
    stateA = viewB.getState('a');
    stateB = viewB.getState('b');
  },
  
  afterEach: function() {
    pane = viewA = viewB = stateA = stateB = responder = null;
  }
});

test("check state A and B are responders -- mouseDown, mouseUp", function (assert) {
  assert.equal(responder, null, "responder should be null");
  assert.ok(stateA.get('isCurrentState'), "state A should be current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be current state");
  
  pane.sendEvent('mouseDown', {}, viewB);
  
  assert.ok(!stateA.get('isCurrentState'), "state A should not be current state");
  assert.ok(stateB.get('isCurrentState'), "state B shold be current state");
  assert.equal(responder, stateA, "state A should be responder");

  pane.sendEvent('mouseUp', {}, viewB);
  
  assert.ok(stateA.get('isCurrentState'), "state A should be current state");
  assert.ok(!stateB.get('isCurrentState'), "state B shold not be current state");
  assert.equal(responder, stateB, "state B should be responder");
});

test("check view B is responder -- keyUp", function (assert) {
  viewB.set('returnValue', true);
  assert.equal(responder, null, "responder should be null");
  pane.sendEvent('keyUp', {}, viewB);
  assert.equal(responder, viewB, "view B should be responder");
});

test("check view A is responder -- keyDown", function (assert) {
  assert.equal(responder, null, "responder should be null");
  pane.sendEvent('keyDown', {}, viewB);
  assert.equal(responder, viewA, "view A should be responder");
});

test("check view A is responder -- click", function (assert) {
  assert.equal(responder, null, "responder should be null");
  pane.sendEvent('click', {}, viewB);
  assert.equal(responder, viewA, "view A should be responder");
});
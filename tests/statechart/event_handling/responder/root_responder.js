// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart */

import { SC, GLOBAL } from '../../../../core/core.js';
import { Async, Statechart, State, EmptyState } from '../../../../statechart/statechart.js';
import { RootResponder } from '../../../../responder/responder.js';

GLOBAL.statechart = null;
var responder, fooInvokedCount;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: No Concurrent States - Root Responder Default Responder Tests", {
  beforeEach: function() {
    fooInvokedCount = 0;
    
    statechart = Statechart.create({
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
          foo: function() { 
            fooInvokedCount++;
            this.gotoState('b'); 
          }
        }),
        
        b: State.design({
          foo: function() {
            fooInvokedCount++;
            this.gotoState('a'); 
          }
        })
        
      })
      
    });
    
    window.statechart.initStatechart();
    
    responder = RootResponder.responder;
    
    SC.RunLoop.begin();
    responder.set('defaultResponder', 'statechart');
    SC.RunLoop.end();
  },
  
  afterEach: function() {
    window.statechart = null;
    responder = null;
    RootResponder.responder.set('defaultResponder', null);
  }
});

test("click button", function (assert) {
  assert.equal(fooInvokedCount, 0, 'foo should not have been invoked');
  assert.equal(statechart.stateIsCurrentState('a'), true, 'state a should be a current state');
  assert.equal(statechart.stateIsCurrentState('b'), false, 'state b should not be a current state');
  
  responder.sendAction('foo');
  
  assert.equal(fooInvokedCount, 1, 'foo should have been invoked once');
  assert.equal(statechart.stateIsCurrentState('a'), false, 'state a should not be a current state');
  assert.equal(statechart.stateIsCurrentState('b'), true, 'state b should be a current state');
  
  responder.sendAction('foo');
  
  assert.equal(fooInvokedCount, 2, 'foo should have been invoked twice');
  assert.equal(statechart.stateIsCurrentState('a'), true, 'state a should be a current state');
  assert.equal(statechart.stateIsCurrentState('b'), false, 'state b should not be a current state');
  
});
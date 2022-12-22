// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart */

import { SC, GLOBAL } from '../../../../core/core.js';
import { Async, Statechart, State, EmptyState } from '../../../../statechart/statechart.js';
import { MainPane } from '../../../../view/view.js';
import { ButtonView } from '../../../../desktop/desktop.js';
import { SCEvent } from '../../../../event/event.js';

GLOBAL.statechart = null;
var pane, button, fooInvokedCount;

// ..........................................................
// CONTENT CHANGING
//

module("Statechart: No Concurrent States - Pane Default Responder Tests", {
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

    statechart.initStatechart();

    SC.RunLoop.begin();
    pane = MainPane.create({
      defaultResponder: 'statechart',
      childViews: [
        ButtonView.extend({
          action: 'foo'
        })
      ]
    });
    pane.append();
    SC.RunLoop.end();

    button = pane.childViews[0];
  },

  afterEach: function() {
    pane.remove();
    pane = button = fooInvokedCount = null;
    window.statechart = null;
  }
});

test("click button", function (assert) {
  var target,
    evt;

  assert.equal(fooInvokedCount, 0, 'foo should not have been invoked');
  assert.equal(statechart.stateIsCurrentState('a'), true, 'state a should be a current state');
  assert.equal(statechart.stateIsCurrentState('b'), false, 'state b should not be a current state');

  target = button.$().get(0);
  evt = SCEvent.simulateEvent(target, 'mousedown', { which: 1 });
  SCEvent.trigger(target, "mousedown", [evt]);
  target = button.$().get(0);
  SCEvent.trigger(target, "mouseup");

  assert.equal(fooInvokedCount, 1, 'foo should have been invoked once');
  assert.equal(statechart.stateIsCurrentState('a'), false, 'state a should not be a current state');
  assert.equal(statechart.stateIsCurrentState('b'), true, 'state b should be a current state');

  target = button.$().get(0);
  evt = SCEvent.simulateEvent(target, 'mousedown', { which: 1 });
  SCEvent.trigger(target, "mousedown", [evt]);
  target = button.$().get(0);
  SCEvent.trigger(target, "mouseup");

  assert.equal(fooInvokedCount, 2, 'foo should have been invoked twice');
  assert.equal(statechart.stateIsCurrentState('a'), true, 'state a should be a current state');
  assert.equal(statechart.stateIsCurrentState('b'), false, 'state b should not be a current state');
});

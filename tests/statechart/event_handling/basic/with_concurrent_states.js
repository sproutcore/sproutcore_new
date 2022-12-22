// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */
import { Async, Statechart, State, EmptyState } from '../../../../statechart/statechart.js';


var statechart = null;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: With Concurrent States - Send Event Tests", {
  beforeEach: function() {

    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'x',
        
        x: State.design({
          
          fooInvokedCount: 0,
          
          foo: function() {
            this.fooInvokedCount++;
          },
          
          substatesAreConcurrent: true,
          
          a: State.design({

            initialSubstate: 'c',

            eventAInvoked: false,

            eventA: function() { this.set('eventAInvoked', true); },

            c: State.design({
              eventB: function() { this.gotoState('d'); },
              eventD: function() { this.gotoState('y'); }
            }),

            d: State.design({
              eventC: function() { this.gotoState('c'); }
            })

          }),

          b: State.design({

            initialSubstate: 'e',

            eventAInvoked: false,

            eventA: function() { this.set('eventAInvoked', true); },

            e: State.design({
              eventB: function() { this.gotoState('f'); },
              eventD: function() { this.gotoState('y'); }
            }),

            f: State.design({
              eventC: function() { this.gotoState('e'); }
            })

          })
          
        }),
        
        y: State.design()
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  afterEach: function() {
    statechart.destroy();
    statechart = null;
  }
});

test("send event eventA", function (assert) {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateB = statechart.getState('b');
      
  monitor.reset();

  assert.equal(stateA.get('eventAInvoked'), false);
  assert.equal(stateB.get('eventAInvoked'), false);

  statechart.sendEvent('eventA');
  
  assert.equal(monitor.get('length'), 0, 'state sequence should be of length 0');
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  assert.equal(stateA.get('eventAInvoked'), true);
  assert.equal(stateB.get('eventAInvoked'), true);
});

test("send event eventB", function (assert) {
  var monitor = statechart.get('monitor');
      
  monitor.reset();
  
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  
  statechart.sendEvent('eventB');
  
  assert.equal(statechart.get('currentStateCount'), 2, 'current state count should be 2');
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  assert.equal(statechart.stateIsCurrentState('f'), true, 'current state should be f');
  
  assert.equal(monitor.get('length'), 4, 'state sequence should be of length 4');
  assert.equal(monitor.matchSequence().begin()
                  .beginConcurrent()
                    .beginSequence()
                      .exited('c')
                      .entered('d')
                    .endSequence()
                    .beginSequence()
                      .exited('e')
                      .entered('f')
                    .endSequence()
                  .endConcurrent()
                .end(), 
          true, 'sequence should be exited[c], entered[d], exited[e], entered[f]');
});

test("send event eventB then eventC", function (assert) {
  var monitor = statechart.get('monitor');

  statechart.sendEvent('eventB');
  
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  assert.equal(statechart.stateIsCurrentState('f'), true, 'current state should be f');

  monitor.reset();
  
  statechart.sendEvent('eventC');

  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');

  assert.equal(monitor.get('length'), 4, 'state sequence should be of length 4');
  assert.equal(monitor.matchSequence().begin()
                  .beginConcurrent()
                    .beginSequence()
                      .exited('d').entered('c')
                    .endSequence()
                    .beginSequence()
                      .exited('f').entered('e')
                    .endSequence()
                  .endConcurrent()
                .end(), 
          true, 'sequence should be exited[d], entered[c], exited[f], entered[e]');
});

test("send event eventD", function (assert) {
  var monitor = statechart.get('monitor');
      
  monitor.reset();
  
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  
  statechart.sendEvent('eventD');
  
  assert.equal(monitor.get('length'), 6, 'state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin()
                  .beginConcurrent()
                    .beginSequence()
                      .exited('c', 'a')
                    .endSequence()
                    .beginSequence()
                      .exited('e', 'b')
                    .endSequence()
                  .endConcurrent()
                  .exited('x')
                  .entered('y')
                .end(), 
          true, 'sequence should be exited[c, a, e, b, x], entered[y]');
          
  assert.equal(statechart.currentStateCount(), 1, 'statechart should only have 1 current state');
  assert.equal(statechart.stateIsCurrentState('c'), false, 'current state not should be c');
  assert.equal(statechart.stateIsCurrentState('e'), false, 'current state not should be e');
  assert.equal(statechart.stateIsCurrentState('y'), true, 'current state should be y');
});

test("send event eventZ", function (assert) {
  var monitor = statechart.get('monitor');
      
  monitor.reset();
  
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  
  assert.equal(monitor.get('length'), 0, 'state sequence should be of length 0');
  
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
});

test("send event foo to statechart and ensure event is only handled once by state X", function (assert) {
  var x = statechart.getState('x');
  
  assert.equal(x.fooInvokedCount, 0, "x.fooInvokedCount should be 0");
  
  statechart.sendEvent('foo');
  
  assert.equal(x.fooInvokedCount, 1, "x.fooInvokedCount should be 1");
});

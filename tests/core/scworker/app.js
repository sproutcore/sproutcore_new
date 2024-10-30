
import { SC } from '/core/core.js';

let counter = 0;

self.myObject = SC.Object.create({
  test: 'mytestval',
  mytestObs: function () {
    console.log('test in worker has changed to', this.get('test'));
    counter += 1;
    this.setIfChanged('test', 'test123456789');
  }.observes('test')
});

SC.onload = () => {
  // now setup something that can be tested for a observable setup...


}

console.log('add_to_worker loaded');

module('SCWorker');

test('test SC.ProxyBinding', function (assert) {
  assert.expect(0);
});

/*
The idea here is that we create a proxy which can be used to "catch" all kind of events and be observable,
pretending to be a certain object which in essence is not in the current "thread".

In many ways it resembles an object controller, but with a major exception, which is that all instances of 
this "controller" need to point at the same communication channel, and cache any data that might be available
at the other side.
Also, the point is that where the object controller has a content, we don't. We will pretend we have though.
*/
import { registerModule } from './root.js';
import { ENV } from './env.js';
import { SCObject } from './object.js';

// this object is a proxy: it will created by the worker manager for a certain path + key
// it serves as an receptical and passes on any info to the worker manager...


export const SCProxy = SCObject.extend({
  _path: null,

  isSCProxy: true,

  _env: ENV, 

  _scWorker: null, // where the workerMgr ref lives...

  _content: null,

  unknownProperty: function (key, value) {
    let c = this._content;
    if (c === null) c = this._content = {};
    if (value === undefined) {
      return c[key];
    }
    else {
      // debugger;
      c[key] = value;
      this.notifyPropertyChange(key);
      this.proxyChange(this, key, value);
    }
    // console.log('unknownProperty in SCProxy in', ENV, 'called with', key, value);
  },

  didAddObserver: function (key, target, method) {
    // console.log(ENV, ': SCProxy#didAddObserver called, registring proxy with scWorker');
    // when the observer has been added, we send a message over to the other side,
    // to connect the observer, and retrieve any current value.
    // first register at workerManager
    this._scWorker.registerProxy(this, key);

    // this._workerMgr._sendToWorker({ cmd: 'observerConnect', origin: guidFor(this) })
  },

  didRemoveObserver: function (key, target, method) {
    this._scWorker.unregisterProxy(this, key);
  },

  // 
  proxyChange: function (sender, key, value, context, rev) {
    // console.log('proxyChanged called on proxy in ', ENV, this._notifiers);
    // will be set up to do any forwarding of change.
    if (!this._notifiers) return;
    if (!this._notifiers.get(key)) return;
    const originIds = [...this._notifiers.get(key).values()];
    this._scWorker._send({ cmd: 'notify', path: this._path, originIds, key, value });
  },

  registerNotifier: function (key, originId) {
    if (!this._notifiers) this._notifiers = new Map();
    if (!this._notifiers.get(key)) this._notifiers.set(key, new Set());
    this._notifiers.get(key).add(originId);
  },

  unregisterNotifier: function (key, originId) {
    if (!this._notifiers) return;
    if (!this._notifiers.get(key)) return;
    this._notifiers.get(key).delete(originId);
    if (this._notifiers.get(key).size === 0) {
      this._notifiers.delete(key);
    }
  }
})

registerModule('scproxy', SCProxy);
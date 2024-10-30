// this sets up the app worker

import { ENV } from './env.js';
import { guidFor, requiredObjectForPropertyPath, tupleForPropertyPath } from './base.js';
import { ObserverQueue } from '../private/observer_queue.js';
import { registerModule, registerRuntimeDep } from './root.js';
// import { Binding } from './binding.js';

/*
Protocol for messaging: RPC like structure

=>  { cmd: requestTupleForPropertyPath, propertyPath: string } 
<=  { cmd: replyTupleForPropertyPath, path: string: null if not found, key: string: null, if not found } 

=> { cmd: importScripts, arg: [urls]}
<=> { cmd: replyImportScripts, result: true when ok or error}
*/

let SCProxy;
let proxyBuffer = [];
registerRuntimeDep('scproxy', v => {
  SCProxy = v.SCProxy;
  if (proxyBuffer) proxyBuffer.forEach(evt => scWorker._handleReply.call(scWorker, evt));
  proxyBuffer = undefined;
});

let RunLoop; 
registerRuntimeDep('runloop', v => {
  RunLoop = v.RunLoop;
});

let Binding;
registerRuntimeDep('binding', v => {
  Binding = v.Binding;
});

export const scWorker = {

  _workerReady: false,

  _msgBuff: [],

  _appWorker: null, 

  init (worker_url, type) {
    if (ENV === 'window') {
      if (!worker_url) return; // don't do anything
      const appWorker = this._appWorker = new Worker(worker_url, { type });


      appWorker.addEventListener('message', this._handleReply.bind(this));
      appWorker.addEventListener('error', err => {
        console.log("Error when loading appworker", err.type);
        throw err;
      });
      appWorker.addEventListener('messageerror', evt => console.log('unable to deserialize message: ', evt));  
    }
    else if (ENV === 'worker') {
      self.addEventListener('message', this._handleReply.bind(this));
      // TODO: here also error handlers
      this._send({ cmd: 'init' });
    }

  },

  // this might become a closure, but keep it "public" for now.
  _paths: new Map(), // 

  _inflight: new Set(),

  /**
   * This is called by the ObserverQueue as soon as the regular tupleForPropertyPath doesn't 
   * return any results. It simply means that we are going to look at the other side whether
   * the property path exists there. 
   *
   * @param {String} path
   * @returns { SCProxy | null }
   */
  tupleForPropertyPath (path) {
    // console.log(ENV,'searching for property path', path);
    // find the key.  It is the last . or first *
    let key;
    let stopAt = path.indexOf('*');
    if (stopAt < 0) stopAt = path.lastIndexOf('.');
    key = (stopAt >= 0) ? path.slice(stopAt + 1) : path;

    const basePath = path.slice(0, stopAt);
    
    const isInFlight = this._inflight.has(basePath);
    if (isInFlight) {
      // console.log(ENV, 'this path is still in flight', basePath);
      return null; // too fast, wait...
    } 

    // check for a path, if the basepath is already known, return the cached object
    const curP = this._paths.get(basePath);
    if (curP) {
      // console.log(ENV, 'found a proxy, return tuplet');
      return [curP, key];
    }
    else {
      // indicate we are in flight
      this._inflight.add(basePath);

      // console.log(ENV, 'not found a proxy, sending request, returning null');
      // perhaps keep track of what is in flight here... to not overdo the number of proxy objects being created... or to create a storm on the message port
      this._send({ cmd: 'requestTupleForPropertyPath', path, basePath, key });
      // setup a question to the other side
      return null;
    }
  },

  _handleRequestTupleForPropertyPath (data) {
    const { path, basePath, key } = data;
    const tuple = tupleForPropertyPath(path); // check whether it exists at all...
    // also retrieve a value to cache
    let value;
    if (tuple && tuple[0]) {
      value = tuple[0].get? tuple[0].get(key): tuple[0][key];
      // console.log(ENV, '_handleRequestTupleForPropertyPath: found object for path in ', basePath);
    }
    const reply = { cmd: "replyTupleForPropertyPath", found: !!tuple, path, basePath, key, value }; // hopefully this doesn't cause issues... it might though if the values are SCObjects... let's see
    // it might also be that sending the value immediately is not a good idea, and we should wait for the automatic synchronisation system of 
    // the bindings
    this._send(reply);
  },

  /**
   * This handles the reply of the main thread or worker for a tuple. If the tuple is answered,
   * it is assumed that the path was requested by the ObserverQueue which required an actual tuple 
   * and the addObserver method to be present to setup the binding / observer relation.
   * 
   *
   * @param {*} evt
   */
  _handleReplyTupleForPropertyPath (data) {
    // two options: found, or not found.
    // if not found, do nothing
    const { path, basePath, key, found, value } = data;

    if (!found) {
      this._inflight.delete(basePath); // no longer in flight
      return; // do nothing
    }
    // if found, we need the following: 
    //- a base property path to register the SCProxy on
    
    
    // on reply here, we immediately create a proxy object to handle
    // the connection will be initiated by didAddObserver on SCProxy
  
    let proxy = this._paths.get(basePath);

    if (!proxy) {
      proxy = SCProxy.create({
        _path: basePath,
        _scWorker: this
      });
      this._paths.set(basePath, proxy);
    }
    this._inflight.delete(basePath); // no longer in flight
    // console.log(ENV, basePath, 'no longer in flight, created a proxy if necessary and calling ObserverQueue to hook up the proxy');
    // make sure the new object is hooked up...
    ObserverQueue.flush(proxy);
    // console.log(ENV, basePath, 'setting value to key to init the binding value');
    proxy.set(key, value); // set immediately so if there is a sync going on, it will have it...

    // console.log(ENV, ': worker indicated target found, now creating a proxy just in case for', basePath);
    // 
  },

  _handleReply (evt) {
    // for the first few messages RunLoop might not be present, that is not an issue, it will be picked up later when it is available.
    if (RunLoop) RunLoop.begin();
    if (!SCProxy) {
      return proxyBuffer.push(evt);
    }
    // console.log(ENV, '_handleReply', evt);
    switch (evt.data.cmd) {
      case 'init': this._workerHasInited(); break;
      case 'replyTupleForPropertyPath': this._handleReplyTupleForPropertyPath(evt.data); break;
      case 'importScripts': this._handleImportScripts(evt.data.urls); break;
      case 'requestTupleForPropertyPath': this._handleRequestTupleForPropertyPath(evt.data); break;
      case 'registerObserver': this._handleRegisterObserver(evt.data); break;
      case 'unregisterObserver': this._handleUnregisterObserver(evt.data); break;
      case 'observerDidRegister': this._handleObserverDidRegister(evt.data); break;
      case 'notify': this._handleNotify(evt.data); break;
      default: 
        throw new Error(ENV + ": scWorker: invalid command: " + evt.data.cmd);
    }
    if (RunLoop) RunLoop.end();
  },

  _send (msg) {
    if (ENV === 'window') {
      if (!this._workerReady) this._msgBuff.push(msg);
      else this._appWorker.postMessage(msg);  
    }
    else {
      // worker
      postMessage(msg);
    }
  },

  _workerHasInited () {
    // console.log(ENV, 'worker has inited, sending ', this._msgBuff.length, 'messages');
    // first send init message,
    // send all buffered messages
    this._workerReady = true;
    if (this._msgBuff.length > 0) {
      this._msgBuff.forEach(m => this._appWorker.postMessage(m));
      this._msgBuff = undefined;
    }
  },

  _handleImportScripts (urls) {
    // console.log('importing scripts', urls);
    let result = true;
    // Promise.all(urls.map(u => {
    //   return import(u);
    // }))
    // .then(r => {
    //   // something more needs to happen here...
    //   postMessage({ cmd: 'replyImportScripts', r});
    // })
    try {
      self.importScripts(urls);
    }
    catch (e) {
      console.log('error importing scripts', e);
      result = e;
    }
  },

  _proxies: new Map(),

  /**
   *This registers a proxy object to be updated whenever an opposite side updates 
   *
   * @param {SCProxy} obj
   */
  registerProxy (obj, key) {
    // console.log(ENV, 'registerProxy for', obj, key);
    if (!obj.isSCProxy) return; 
    const originId = guidFor(obj);
    // if proxy is already known (which happens when a proxy's didAddObserver is called when the binding is initiated from the other direction)
    // don't save, and don't send a message to the other side...
    if (!this._proxies.has(obj._path)) { // if the proxy is this sided...
      this._proxies.set(originId, obj);
      // now send message to the other side to connect the observer relation
      this._send({ cmd: "registerObserver", basePath: obj._path, key, originId });
      // this should cause a reply with similar   
    }
  },

  _handleRegisterObserver (data) {
    // this means the other side wants to register an observer, so we have to do the same
    // on this side...
    // we keep originId to easily communicate later without paths (?)
    const { basePath, key, originId } = data;
    // console.log(ENV, 'handleRegisterObserver for', basePath, key, originId);

    const target = requiredObjectForPropertyPath(basePath);
    // get proxy if already exists
    let proxy = this._proxies.get(basePath);
    if (!proxy) {
      proxy = SCProxy.create({
        _scWorker: this,
        _path: basePath,
      });
      this._proxies.set(basePath, proxy);
    }
    // allow direct communication means that for this key we need to save the originId, so we know who to 
    // notify on the other side...
    proxy.registerNotifier(key, originId);
    // add key observers
    // debugger;
    proxy[key+'BindingDefault'] = Binding; // provide a binding default.
    proxy.bind(key, [target, key]);
    const targetId = guidFor(proxy);
    // send back the proxy of the 
    this._send({ cmd: 'observerDidRegister', targetId, key, basePath, originId });
    this._proxies.set(targetId, proxy);
    // target.addObserver(key, proxy, 'proxyChange');
    // also retrieve the target[key] and send back the initial value
    // const val = target.get? target.get(key): target[key];

  },

  _handleObserverDidRegister (data) {
    const {key, basePath, targetId, originId } = data;
    // console.log(ENV, 'handleObserverDidRegister, setting targetId', targetId, basePath, key);

    const proxy = this._proxies.get(originId);
    proxy.registerNotifier(key, targetId);
  },

  unregisterProxy (obj, key) {
    if (!obj.isSCProxy) return; 
    const guid = guidFor(obj);
    this._proxies.delete(guid);
    this._send({ cmd: 'unregisterObserver', path: obj._path, key, originId: guid});

  },

  _handleUnregisterObserver (data) {
    // perhaps clean up proxy objects if nothing remains to observe...
    //this._kvo_for('_kvo_observed_keys', CoreSet).remove(key);

  },

  _handleNotify (data) {
    const { path, originIds, value, key} = data;
    // console.log(ENV, ': handling notification of change: ', path, key, value, originIds);
    // debugger;
    originIds.forEach(id => {
      const p = this._proxies.get(id);
      p.setIfChanged(key, value); 
    });
  }
}

if (ENV === 'worker') scWorker.init();

registerModule('scworker', scWorker);

// // I strongly think that simply assigning _handleWorkerReply will also work because of using a ES6 method instead of a function
// // appWorker.onmessage = function (evt) {
// //   workerManager._handleWorkerReply.call(workerManager, evt);
// // }
// export const appWorker = new Worker('/core/system/appworker.js');

// appWorker.postMessage("init");

// appWorker.addEventListener('message', workerManager._handleWorkerReply);
// appWorker.addEventListener('error', err => {
//   console.log("Error when loading appworker", err.type);
//   throw err;
// });
// appWorker.addEventListener('messageerror', evt => console.log('unable to deserialize message: ', evt));


// part of the system to separate app logic from view logic by worker
// this is the file first loaded as worker, which provides controls for the rest of the app to 
// load certain files, or to setup communication

// biggest issue atm is that firefox does not support ES6 modules in workers...





// send the initiator the sign we are ready to rock..

// interesting: could test cases run here?
// how would the binding work exactly... I would expect that values can be copied
// so that if a view has a binding to a controller, the requests for data will be sent 
// back and forth, like an RPC system.

/*
In a way I need two kinds of pictures: one is how the binding is actually set up (which is done in the runloop eventually)
and the way changes come in through the binding.

A binding is actually an object to set up a two sided observer: it is an object which installs an observer on both sides.
The reason for it to be an object in itself is that it also allows unbinding this relationship.

In the case of a remote binding / worker binding, it actually means that there are even more observers:
The binding works in a "normal" way, but is bound to an object which is updated from, and sends updates to an object
on the other side of the divide. On that side, you'd have the mirror of this system, which binds to the actual object at hand.

So, the system uses Observable#addObserver and Observable#remoteObserver to set up the relation, though it only does this
at the end of the runloop. The RunLoop being in the picture is an advantage because if for some reason the worker did not respond yet, we can reschedule the connect

When a binding is made, the connect is postponed to the end of the runloop.
The binding is connected at the end of the runloop by adding observers to the observer queue.
The observer queue is processed at the end of every runloop to set up any remaining observers in the queue.
If the tuple to which the observer is pointing does not exist, the observer setup is requeueued.

So, in a way a cross worker observer could work... as in: when the tuple doesn't exist (which it doesn't locally if the targeted object is at the other side)
a request is sent to the worker manager, which checks whether that path exists on the other side. The observer is requeued.
When the path does exist on the other side, the worker manager creates a proxy object.
There are two ways of doing this, being pretending or not pretending.
Not pretending means that the worker manager locally recreates the path, so the binding works in a normal way.
pretending means that tupleForPropertyPath is adjusted to also check the worker manager for a path. If that path exists at the worker manager,
it returns a proxy object for that path.

To me it seems that the pretending system is less likely to cause issues and lighter on the system: only the objects that are actually necessary are created.

it seems that this should work a bit different...
The original idea is that we load a minimal worker which then loads files on demand.
With the import / ES6 module mode that is no longer possible, as importScripts is not supported for webworkers running in ES6 module mode.

So, this means that the worker has to statically import a specific file (say "app.js") which needs to load everything necessary through imports.
There is a bit of an issue here, because if the app has certain views, these views need to be "transported" to the main thread...
technically that might be a simple "trancoding", or trying a real transfer, but because of the recursive nature of SC objects, this might become
complex...
So, let's say that we need some kind of an app.js / a little bit like the core.js of "old days".
Something similar has to be done for anything outside the worker, specifically views.

This app.js will NEED to load this appworker, or SC core needs to have some clever load method, to check whether it is being loaded in a worker or 
in a main thread...

Also interesting is that the workermanager and appworker side can be integrated with the root responder system.


It might in the end be even better to have the separation even further, as in that only the renderers are in the main thread.
The issue with this is though that it might cause other issues, such as handling of events...
perhaps even more threads?
*/
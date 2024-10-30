// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { setSetting, getSetting } from './settings.js';
import global from './global.js';
import { APP_MODE, T_STRING } from './constants.js';
import { typeOf } from './base.js';
import { RunLoop } from './runloop.js';

// import { __runtimeDeps as obsRuntimeDeps } from '../mixins/observable.js';
// import { __runtimeDeps as aryRuntimeDeps } from '../mixins/array.js';
// import { __runtimeDeps as obsSetRuntimeDeps } from '../private/observer_set.js';
// import { __runtimeDeps as objRuntimeDeps } from './object.js';
// // import { __runtimeDeps as bindingRuntimeDeps } from './binding.js';
// import { __runtimeDeps as scWorkerRuntimeDeps } from './scworker.js';


setSetting('BENCHMARK_LOG_READY', true);

setSetting('isReady', false);
setSetting('suppressOnReady', false);
setSetting('suppressMain', false);

if (!getSetting('_readyQueue')) {
  setSetting('_readyQueue', []);
}

let Locale;
const localeRuntimeDeps = async function () {
  const l = await import('./locale.js');
  Locale = l.Locale;
}

const runtimeDeps = [
  // scWorkerRuntimeDeps(),
  // obsRuntimeDeps(),
  // aryRuntimeDeps(),
  // bindingRuntimeDeps(),
  // obsSetRuntimeDeps(),
  // objRuntimeDeps(),
  // localeRuntimeDeps(),
];

// if (global.jQuery) {
//   // let apps ignore the regular onReady handling if they need to
//   if (!getSetting('suppressOnReady')) {
//     // global.$(document).ready(readyMixin.onReady.done.bind(readyMixin.onReady));
//     global.jQuery(readyMixin.onReady.done.bind(readyMixin.onReady));
//   }
// }

// there might be a more dynamic way to do this...
// Promise.all(runtimeDeps).then(r => {
//   console.log("PROMISE OF imports");
//   if (SC.onload && typeof SC.onload === 'function') {
//     SC.onload();
//   }  
//   // if (!global.jQuery) {
//   //   SC.onReady.done();
//   // }
//   // trigger SC.onReady?
//   // SC.onReady.done();
// })

export function registerRuntimeDep(p) {
  runtimeDeps.push(p);
}


export const readyMixin = {

  get isReady() {
    return getSetting('isReady');
  },

  set isReady(val) {
    setSetting('isReady', val);
  },

  /**
    Allows apps to avoid automatically attach the ready handlers if they
    want to by setting this flag to true

    @type Boolean
  */
  get suppressOnReady() {
    return getSetting('suppressOnReady');
  },

  set suppressOnReady(val) {
    setSetting('suppressOnReady', val);
  },

  /**
    Allows apps to avoid automatically invoking main() when onReady is called

    @type Boolean
  */
  get suppressMain() {
    return getSetting('suppressMain');
  },

  set suppressMain(val) {
    setSetting('suppressMain', val);
  },


  get mode() {
    return getSetting('mode');
  },

  set mode(val) {
    setSetting('mode', val);
  },

  _readyQueue: null,

  /**
    Add the passed target and method to the queue of methods to invoke when
    the document is ready.  These methods will be called after the document
    has loaded and parsed, but before the main() function is called.

    Methods are called in the order they are added.

    If you add a ready handler when the main document is already ready, then
    your handler will be called immediately.

    @param target {Object} optional target object
    @param method {Function} method name or function to execute
    @returns {SC}
  */
  ready: function (target, method) {

    var queue = getSetting('_readyQueue');

    // normalize
    if (method === undefined) {
      method = target;
      target = null;
    } else if (typeOf(method) === T_STRING) {
      method = target[method];
    }

    if (getSetting('isReady')) {
      if (global.jQuery) {
        console.log('we have jquery queue, use jquery');
        jQuery(function () { method.call(target); });
      }
      else {
        method.call(target);
      }
    } else {
      // console.log('pushing method to queue');
      const idx = queue.push(function () { method.call(target); });
      // console.log('function pushed to ', idx);
    }

    return this;
  },

  onReady: {

    done: async function () {

      console.log("SPROUTCORE_READY_DONE_FUNCTION");
      // first wait till the promises are resolved
      if (getSetting('isReady')) return;
      setSetting('isReady', true);
      
      return Promise.all(runtimeDeps).then(() => {
        console.log("SPROUTCORE READY_DONE AFTER promise.all");

        RunLoop.begin();

        var queue = getSetting('_readyQueue'), idx, len;
        const promises = [loadClassicScripts()];
        if (queue) {
          for (idx = 0, len = queue.length; idx < len; idx++) {
            // console.log('calling', idx);
            // debugger;
            const ret = queue[idx].call();
            if (ret instanceof Promise) {
              promises.push(ret);
            }
          }
          // _readyQueue = null;
        }

        return Promise.all(promises).then(r => {
          if (Locale) {
            console.log("GENERATING LOCALE");
            Locale.createCurrentLocale();
            var loc = Locale.currentLanguage.toLowerCase();
            if (global.jQuery) {
              jQuery("body").addClass(loc);
  
              jQuery("html").attr("lang", loc);
  
              jQuery("#loading").remove();
            }
            else if (global.SC && global.SC.CoreQuery) {
              SC.CoreQuery("#loading").remove();
            }
            else {
              const loadingDiv = document.getElementById("loading");
              if (loadingDiv) {
                loadingDiv.remove();
              }
            }
          }

          console.log("About to run global main");
          if (global.main && !getSetting('suppressMain') && (getSetting('mode') === APP_MODE)) { global.main(); }
          RunLoop.end();
        });

      })
        .catch(e => {
          console.error("SC.onReady#done: Error in resolving runtime dependency promises", e);
          setSetting('isReady', false);
        });
    }
  }

};

if (global.jQuery) {
  // let apps ignore the regular onReady handling if they need to
  if (!getSetting('suppressOnReady')) {
    // global.$(document).ready(readyMixin.onReady.done.bind(readyMixin.onReady));
    jQuery(readyMixin.onReady.done);
    // jQuery(readyMixin.onReady.done.bind(readyMixin.onReady));
  }
}
else if (global.onload === null) {
  if (!getSetting('suppressOnReady')) {
    console.log('setting onload');
    // global.onload = readyMixin.onReady.done;
    if (global.addEventListener && global.addEventListener instanceof Function) {
      global.addEventListener('load', readyMixin.onReady.done);
    }
    else {
      global.onload = readyMixin.onReady.done;
    }
  }
}


// default to app mode.  When loading unit tests, this will run in test mode

setSetting('mode', APP_MODE);

function loadClassicScripts() {
  console.log("LOADING classic scripts");
  const scripts = Array.from(document.querySelectorAll("script[type=sc_classic]"));
  return Promise.all(scripts.map(s => {
    return new Promise((res, rej) => {
      const script = document.createElement('script');
      script.async = false;
      script.src = s.src;
      script.onload = function () {
        console.log('script', s.src, 'loaded');
        res();
      };
      script.onerror = function (e) {
        rej(e);
      }
      document.body.appendChild(script);
    });
  }));

}

import { ObserverSet } from './private/observer_set.js';

import global from "./system/global.js";
import { getSetting, setSetting } from "./system/settings.js";
import { SCString } from "./system/string.js";
import './ext/number.js';
import './ext/string.js';
import { Copyable } from './mixins/copyable.js';
import { Comparable } from './mixins/comparable.js';
import { Enumerable } from './mixins/enumerable.js';
import { Freezable } from './mixins/freezable.js';
import { PropertyChain } from './private/property_chain.js';
import { SCObject, kindOf, instanceOf, _object_className, _enhance } from './system/object.js';
import { Observable, get, getPath } from './mixins/observable.js';
import { CoreArray, SCArray } from './mixins/array.js';
import { ObserverQueue } from './private/observer_queue.js';
import './ext/array.js';
import { RunLoop, run } from './system/runloop.js';
import { Binding } from './system/binding.js';
import { IndexSet } from './system/index_set.js';
import { Logger, warn, error } from './system/logger.js';
import { SCError, ok, val, $throw, $error, $ok, $val } from './system/error.js';
import { SCSet } from './system/set.js';
import { RangeObserver } from './system/range_observer.js';
import { typeOf, clone, hashFor, compare, guidFor, inspect, keys, isArray, none, isEqual, empty, makeArray, A, objectForPropertyPath, requiredObjectForPropertyPath, tupleForPropertyPath, mixin, beget, merge, generateGuid } from './system/base.js';
import { VERSION, T_ERROR, T_OBJECT, T_NULL, T_CLASS, T_HASH, T_FUNCTION, T_UNDEFINED, T_NUMBER, T_STRING, T_BOOL, T_ARRAY, T_DATE, FROZEN_ERROR, UNSUPPORTED, APP_MODE, TEST_MODE, BRANCH_OPEN, BRANCH_CLOSED, LEAF_NODE, DROP_ON, DROP_BEFORE, DROP_ANY, DROP_AFTER, CLEAN, DIRTY, EMPTY, ERROR, READY, READY_CLEAN, READY_DIRTY } from './system/constants.js';
// import * as constants from './system/constants.js';
import { Controller } from './controllers/controller.js';
import { ObjectController } from './controllers/object_controller.js';
import { ArrayController } from './controllers/array_controller.js';
import { SCProxy } from './system/proxy.js';
import { ENV } from './system/env.js';
import { scWorker } from './system/scworker.js';
import { Builder } from './system/builder.js';
import { DelegateSupport } from './mixins/delegate_support.js';
import { CoreSet } from './system/core_set.js';

import { detectedBrowser, OS, CLASS_PREFIX, CSS_PREFIX, BROWSER, ENGINE, DEVICE, DOM_PREFIX } from './system/browser.js';
import { readyMixin, registerRuntimeDep } from './system/ready.js';

import { Locale, metricsFor, stringsFor, methodForLocale,  hashesForLocale, loadLangFiles } from './system/locale.js';
import { Timer } from './system/timer.js';
import { ZERO_RANGE, RANGE_NOT_FOUND, valueInRange, minRange, maxRange, unionRanges, intersectRanges, subtractRanges, rangesEqual, cloneRange } from './system/utils/range.js';
import { SparseArray } from './system/sparse_array.js';
import { DateTime } from './system/datetime/datetime.js';
import { dateTimeBinding } from './system/datetime/datetime_binding.js';
import { TreeController } from './controllers/tree.js';
import { TreeItemObserver } from './private/tree_item_observer.js';
import { TreeItemContent } from './mixins/tree_item_content.js';
import { CollectionContent } from './mixins/collection_content.js';
import { SelectionSet } from './system/selection_set.js';
import { Task } from './system/task/task.js';
import { TaskQueue, backgroundTaskQueue } from './system/task_queue.js';

// add dateTimeBinding to Binding
Binding.dateTime = dateTimeBinding;


export const GLOBAL = global;

console.log('COREJS, executed...');

// /** @type {import('../typings/core').SC} */

export const SC = {
  VERSION,
  getSetting,
  setSetting,
  
  get LOG_BINDINGS () {
    return getSetting('LOG_BINDINGS');
  },
  set LOG_BINDINGS (val) {
    setSetting('LOG_BINDINGS', val);
  },
  get LOG_DUPLICATE_BINDINGS () {
    return getSetting('LOG_DUPLICATE_BINDINGS');
  },
  set LOG_DUPLICATE_BINDINGS (val) {
    setSetting('LOG_DUPLICATE_BINDINGS', val);
  },
  get LOG_OBSERVERS () {
    return getSetting('LOG_OBSERVERS');
  },
  set LOG_OBSERVERS (val) {
    setSetting('LOG_OBSERVERS', val);
  },
  beget,
  generateGuid,
  String: SCString,
  Copyable,
  Comparable,
  Enumerable,
  Observable,
  Freezable,
  get,
  getPath,
  Object: SCObject,
  _object_className,
  _enhance,
  Array: SCArray,
  Error: SCError,
  RunLoop,
  Timer,
  IndexSet,
  run,
  Binding,
  Logger,
  CoreSet,
  ObserverSet,
  RangeObserver,
  ObserverQueue,
  PropertyChain,
  // Observers: ObserverQueue, // backwards compat
  Set: SCSet,
  typeOf,
  clone,
  copy: clone,
  merge,
  compare,
  hashFor,
  guidFor,
  inspect,
  keys,
  isArray,
  none,
  empty,
  isEqual,
  makeArray,
  kindOf,
  instanceOf,
  A,
  $A: A,
  objectForPropertyPath,
  requiredObjectForPropertyPath,
  tupleForPropertyPath,
  T_UNDEFINED,
  T_ARRAY,
  T_OBJECT,
  T_NUMBER,
  T_HASH,
  T_STRING,
  T_BOOL,
  T_CLASS,
  T_DATE,
  T_ERROR,
  T_NULL,
  T_FUNCTION,
  FROZEN_ERROR,
  UNSUPPORTED,
  APP_MODE,
  TEST_MODE,
  BRANCH_OPEN,
  BRANCH_CLOSED,
  LEAF_NODE,
  DROP_ON,
  DROP_BEFORE,
  DROP_AFTER,
  DROP_ANY,
  EMPTY,
  $error,
  $ok,
  $throw,
  $val,
  val,
  ok,
  warn,
  error,
  json: {
    encode (root) {
      return JSON.stringify(root);
    },
    decode (root) {
      return JSON.parse(root);
    }
  },
  Controller,
  ObjectController,
  ArrayController,
  Proxy: SCProxy,
  ENV,
  scWorker,
  mixin,
  Builder,
  browser: detectedBrowser,
  OS,
  CLASS_PREFIX,
  CSS_PREFIX,
  BROWSER,
  ENGINE,
  DEVICE,
  DOM_PREFIX,
  DelegateSupport,
  Locale,
  methodForLocale,
  stringsFor,
  metricsFor,
  hashesForLocale,
  ZERO_RANGE,
  RANGE_NOT_FOUND,
  valueInRange,
  minRange,
  maxRange,
  unionRanges,
  intersectRanges,
  subtractRanges,
  cloneRange,
  rangesEqual,
  SparseArray,
  DateTime,
  loadLangFiles,
  TreeItemContent,
  TreeItemObserver,
  TreeController,
  CollectionContent,
  SelectionSet,
  registerRuntimeDep,
  Task,
  TaskQueue,
  backgroundTaskQueue
};

mixin(SC, readyMixin);


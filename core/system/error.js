// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// @global SC

import { SCObject } from './object.js';
import { Logger } from './logger.js';
import { guidFor } from './base.js';
import { get } from '../mixins/observable.js';
import { registerModule } from './root.js';

/**
  @class

  An error, used to represent an error state.

  Many API's within SproutCore will return an instance of this object whenever
  they have an error occur.  An error includes an errorValue, description,
  and optional human readable label that indicates the item that failed.

  Depending on the error, other properties may also be added to the object
  to help you recover from the failure.

  You can pass error objects to various UI elements to display the error in
  the interface. You can easily determine if the errorValue returned by some API is
  an error or not using the helper SC.ok(errorValue).

  Faking Error Objects
  ---

  You can actually make any object you want to be treated like an Error object
  by simply implementing two properties: isError and errorValue.  If you
  set isError to true, then calling SC.ok(obj) on your object will return false.
  If isError is true, then SC.val(obj) will return your errorValue property
  instead of the receiver.

  When using SC.typeOf(obj), SC.T_ERROR will only be returned if the obj
  is an instance of SCError

  @since SproutCore 1.0
*/
export const SCError = SCObject.extend(
  /** @scope SCError.prototype */
  {

    /**
      Human readable description of the error.  This can also be a non-localized
      key.

      @type String
    */
    message: '',

    /**
      The errorValue the error represents.  This is used when wrapping a errorValue inside
      of an error to represent the validation failure.

      @type Object
    */
    errorValue: null,

    /**
      The original error object.  Normally this will return the receiver.
      However, sometimes another object will masquerade as an error; this gives
      you a way to get at the underlying error.

      @returns {SCError}
    */
    errorObject: function () {
      return this;
    }.property().cacheable(),

    /**
      Throw the error.

      @returns SCError
    */
    'throw': function () {
      var error = this.toString();
      Logger.error(error);

      throw new Error(error);
    },

    /**
      The error stacktrace.

      @returns SCError
    */
    trace: function () {
      return (new Error()).trace;
    }.property().cacheable(),

    /**
      Human readable name of the item with the error.

      @type String
    */
    label: null,

    /** @private */
    toString: function () {
      return "SCError:%@:%@ (%@)".fmt(guidFor(this), this.get('message'), this.get('errorValue'));
    },

    /**
      Walk like a duck.

      @type Boolean
    */
    isError: true,

    /** 
     *  Make this specifically an SC Error, saves a instanceof check
     */
    _isSCError: true
  });

SCError.mixin({

  /**
    Creates a new SCError instance with the passed description, label, and
    errorValue.  All parameters are optional.

    @param description {String} human readable description of the error
    @param label {String} human readable name of the item with the error
    @param errorValue {Number} an errorValue to use for testing.
    @returns {SCError} new error instance.
  */
  desc: function (description, label, errorValue) {
    var opts = {
      message: description
    };
    if (label !== undefined) opts.label = label;
    if (errorValue !== undefined) opts.errorValue = errorValue;
    return this.create(opts);
  },

  /**
    Throw a new SCError instance with the passed description, label, and
    errorValue.  All parameters are optional.

    @param description {String} human readable description of the error
    @param label {String} human readable name of the item with the error
    @param errorValue {Number} an errorValue to use for testing.
    @returns {SCError} new error instance.
  */
  'throw': function (description, label, errorValue) {
    this.desc.apply(this, arguments).throw();
  }

});

/**
  Shorthand form of the SCError.desc method.

  @param {String} description {String} human readable description of the error
  @param {String} label {String} human readable name of the item with the error
  @param {Number} [errorValue] {Number} an errorValue to use for testing.
  @returns {SCError} new error instance.
*/
export const $error = function (description, label, errorValue) {
  return SCError.desc(description, label, errorValue);
};

/**
  Shorthand form of the SCError.throw method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param errorValue {Number} an errorValue to use for testing.
  @returns {SCError} new error instance.
*/
export const throwError = function (description, label, errorValue) {
  SCError.throw(description, label, errorValue);
};

/** @private */
export const $throw = throwError;

/**
  Returns false if the passed errorValue is an error object or false.

  @param {Object} ret object errorValue
  @returns {Boolean}
*/
export const ok = function (ret) {
  return (ret !== false) && !(ret && ret.isError);
};

/** @private */
export const $ok = ok;

/**
  Returns the errorValue of an object.  If the passed object is an error, returns
  the errorValue associated with the error; otherwise returns the receiver itself.

  @param {Object} obj the object
  @returns {Object} errorValue
*/
export const val = function (obj) {
  if (get(obj, 'isError')) {
    return get(obj, 'errorValue');
  } else return obj;
};

/** @private */
export const $val = val;

// STANDARD ERROR OBJECTS

/**
  Standard errorValue for errors that do not support multiple errorValues.

  @type Number
*/
SCError.HAS_MULTIPLE_VALUES = -100;


registerModule('scerror', SCError);
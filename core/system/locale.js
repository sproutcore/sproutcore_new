// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { clone, guidFor, mixin, typeOf } from './base.js';
import { T_NUMBER, T_STRING } from './constants.js';
import { warn } from './logger.js';
import { SCObject } from './object.js';
import { detectedBrowser as browser } from './browser.js';
import { readyMixin } from './ready.js';
import { registerModule } from './root.js';

/**
  The Locale defined information about a specific locale, including date and
  number formatting conventions, and localization strings.  You can define
  various locales by adding them to the locales hash, keyed by language
  and/or country code.

  On page load, the default locale will be chosen based on the current
  languages and saved at Locale.current.  This locale is used for
  localization, etc.

  ## Creating a new locale

  You can create a locale by simply extending the Locale class and adding
  it to the locales hash:

      Locale.locales['en'] = Locale.extend({ .. config .. }) ;

  Alternatively, you could choose to base your locale on another locale by
  extending that locale:

      Locale.locales['en-US'] = Locale.locales['en'].extend({ ... }) ;

  Note that if you do not define your own strings property, then your locale
  will inherit any strings added to the parent locale.  Otherwise you must
  implement your own strings instead.

  
  @since SproutCore 1.0
*/
export const Locale = SCObject.extend({

  init: function init () {
    // init.base.apply(this); // the original doesn't call sc_super... why?
    
    // make sure we know the name of our own locale.
    if (!this.language) Locale._assignLocales();

    // Make sure we have strings that were set using the new API.  To do this
    // we check to a bool that is set by one of the string helpers.  This
    // indicates that the new API was used. If the new API was not used, we
    // check to see if the old API was used (which places strings on the
    // String class).
    if (!this.hasStrings) {
      var langs = this._deprecatedLanguageCodes || [] ;
      langs.push(this.language);
      var idx = langs.length ;
      var strings = null ;
      while(!strings && --idx >= 0) {
        strings = String[langs[idx]];
      }
      if (strings) {
        this.hasStrings = true;
        this.strings = strings ;
      }
    }
  },

  /** Set to true when strings have been added to this locale. */
  hasStrings: false,

  /** The strings hash for this locale. */
  strings: {},

  /**
    The metrics for this locale.  A metric is a singular value that is usually
    used in a user interface layout, such as "width of the OK button".
  */
  metrics: {},

  /**
    The inflection constants for this locale.
  */
  inflectionConstants: null,

  /**
    The method used to compute the ordinal of a number for this locale.
  */
  ordinalForNumber: function(number) { 
    return '';
  },


  toString: function() {
    if (!this.language) Locale._assignLocales() ;
    return "Locale["+this.language+"]"+guidFor(this) ;
  },

  /**
    Returns the localized version of the string or the string if no match
    was found.

    @param {String} string
    @param {String} optional default string to return instead
    @returns {String}
  */
  locWithDefault: function(string, def) {
    var ret = this.strings[string];

    // strings may be blank, so test with typeOf.
    if (typeOf(ret) === T_STRING) return ret;
    else if (typeOf(def) === T_STRING) return def;
    return string;
  },

  /**
    Returns the localized value of the metric for the specified key, or
    undefined if no match is found.

    @param {String} key
    @returns {Number} ret
  */
  locMetric: function(key) {
    var ret = this.metrics[key];
    if (typeOf(ret) === T_NUMBER) {
      return ret;
    }
    else if (ret === undefined) {
      warn("No localized metric found for key \"" + key + "\"");
      return undefined;
    }
    else {
      warn("Unexpected metric type for key \"" + key + "\"");
      return undefined;
    }
  },

  /**
    Creates and returns a new hash suitable for use as an View’s 'layout'
    hash.  This hash will be created by looking for localized metrics following
    a pattern based on the “base key” you specify.

    For example, if you specify "Button.Confirm", the following metrics will be
    used if they are defined:

      Button.Confirm.left
      Button.Confirm.top
      Button.Confirm.right
      Button.Confirm.bottom
      Button.Confirm.width
      Button.Confirm.height
      Button.Confirm.midWidth
      Button.Confirm.minHeight
      Button.Confirm.centerX
      Button.Confirm.centerY

    Additionally, you can optionally specify a hash which will be merged on top
    of the returned hash.  For example, if you wish to allow a button’s width
    to be configurable per-locale, but always wish for it to be centered
    vertically and horizontally, you can call:

      locLayout("Button.Confirm", {centerX:0, centerY:0})

    …so that you can combine both localized and non-localized elements in the
    returned hash.  (An exception will be thrown if there is a locale-specific
    key that matches a key specific in this hash.)

    @param {String} baseKey
    @param {String} (optional) additionalHash
    @returns {Object}
  */
  locLayout: function(baseKey, additionalHash) {
    // Note:  In this method we'll directly access this.metrics rather than
    //        going through locMetric() for performance and to avoid
    //        locMetric()'s sanity checks.

    var i, len, layoutKey, key, value,
        layoutKeys = Locale.layoutKeys,
        metrics    = this.metrics,

        // Cache, to avoid repeated lookups
        typeOfFunc = typeOf,
        numberType = T_NUMBER,

        ret        = {};


    // Start off by mixing in the additionalHash; we'll look for collisions with
    // the localized values in the loop below.
    if (additionalHash) mixin(ret, additionalHash);


    // For each possible key that can be included in a layout hash, see whether
    // we have a localized value.
    for (i = 0, len = layoutKeys.length;  i < len;  ++i) {
      layoutKey = layoutKeys[i];
      key       = baseKey + "." + layoutKey;
      value     = metrics[key];

      if (typeOfFunc(value) === numberType) {
        // We have a localized value!  As a sanity check, if the caller
        // specified an additional hash and it has the same key, we'll throw an
        // error.
        if (additionalHash  &&  additionalHash[layoutKey]) {
          throw new Error("locLayout():  There is a localized value for the key '" + key + "' but a value for '" + layoutKey + "' was also specified in the non-localized hash");
        }

        ret[layoutKey] = value;
      }
    }

    return ret;
  }

}) ;

Locale.mixin(/** @scope Locale */ {

  /**
    If true, localization will favor the detected language instead of the
    preferred one.
  */
  useAutodetectedLanguage: false,

  /**
    This property is set by the build tools to the current build language.
  */
  preferredLanguage: null,

  /**
    This property holds all attributes name which can be used for a layout hash
    (for an View).  These are what we support inside the layoutFor() method.
  */
  layoutKeys: ['left', 'top', 'right', 'bottom', 'width', 'height',
               'minWidth', 'minHeight', 'centerX', 'centerY'],

  /**
    Invoked at the start of SproutCore's document onready handler to setup
    the currentLocale.  This will use the language properties you have set on
    the locale to make a decision.
  */
  createCurrentLocale: function() {
    // get values from String if defined for compatibility with < 1.0 build
    // tools.
    var autodetect = (String.useAutodetectedLanguage !== undefined) ? String.useAutodetectedLanguage : this.useAutodetectedLanguage;
    var preferred = (String.preferredLanguage !== undefined) ? String.preferredLanguage : this.preferredLanguage ;


    // determine the language
    var lang = ((autodetect) ? browser.language : null) || preferred || browser.language || 'en';
    lang = Locale.normalizeLanguage(lang) ;
    // get the locale class.  If a class cannot be found, fall back to generic
    // language then to english.
    var klass = this.localeClassFor(lang) ;

    // if the detected language does not match the current language (or there
    // is none) then set it up.
    if (lang != this.currentLanguage) {
      this.currentLanguage = lang ; // save language
      this.currentLocale = klass.create(); // setup locale
    }
    return this.currentLocale ;
  },

  /**
    Finds the locale class for the names language code or creates on based on
    its most likely parent.
  */
  localeClassFor: function(lang) {
    lang = Locale.normalizeLanguage(lang) ;
    var parent, klass = this.locales[lang];

    // if locale class was not found and there is a broader-based locale
    // present, create a new locale based on that.
    if (!klass && ((parent = lang.split('-')[0]) !== lang) && (klass = this.locales[parent])) {
      klass = this.locales[lang] = klass.extend() ;
    }

    // otherwise, try to create a new locale based on english.
    if (!klass) klass = this.locales[lang] = this.locales.en.extend();

    return klass;
  },

  /**
    Shorthand method to define the settings for a particular locale.
    The settings you pass here will be applied directly to the locale you
    designate.

    If you are already holding a reference to a locale definition, you can
    also use this method to operate on the receiver.

    If the locale you name does not exist yet, this method will create the
    locale for you, based on the most closely related locale or english.  For
    example, if you name the locale 'fr-CA', you will be creating a locale for
    French as it is used in Canada.  This will be based on the general French
    locale (fr), since that is more generic.  On the other hand, if you create
    a locale for mandarin (cn), it will be based on generic english (en)
    since there is no broader language code to match against.

    @param {String} localeName
    @param {Object} options
    @returns {Locale} the defined locale
  */
  define: function(localeName, options) {
    var locale ;
    if (options===undefined && (typeOf(localeName) !== T_STRING)) {
      locale = this; options = localeName ;
    } else locale = Locale.localeClassFor(localeName) ;
    mixin(locale.prototype, options) ;
    return locale ;
  },

  /**
    Gets the current options for the receiver locale.  This is useful for
    inspecting registered locales that have not been instantiated.

    @returns {Object} options + instance methods
  */
  options: function() { return this.prototype; },

  /**
    Adds the passed hash to the locale's given property name.  Note that
    if the receiver locale inherits its hashes from its parent, then the
    property table will be cloned first.

    @param {String} name
    @param {Object} hash
    @returns {Object} receiver
  */
  addHashes: function(name, hash) {
    // make sure the target hash exists and belongs to the locale
    var currentHash = this.prototype[name];
    if (currentHash) {
      if (!this.prototype.hasOwnProperty(currentHash)) {
        currentHash = this.prototype[name] = clone(currentHash);
      }
    }
    else {
      currentHash = this.prototype[name] = {};
    }

    // add hash
    if (hash) this.prototype[name] = mixin(currentHash, hash);

    return this;
  },

  /**
    Adds the passed method to the locale's given property name. 

    @param {String} name
    @param {Function} method
    @returns {Object} receiver
  */
  addMethod: function(name, method) {
    this.prototype[name] = method;
    return this;
  },

  /**
    Adds the passed hash of strings to the locale's strings table.  Note that
    if the receiver locale inherits its strings from its parent, then the
    strings table will be cloned first.

    @returns {Object} receiver
  */
  addStrings: function(stringsHash) {
    var ret = this.addHashes('strings', stringsHash);

    // Note:  We don't need the equivalent of this.hasStrings here, because we
    //        are not burdened by an older API to look for like the strings
    //        support is.
    this.prototype.hasStrings = true;

    return ret;
  },

  /**
    Adds the passed hash of metrics to the locale's metrics table, much as
    addStrings() is used to add in strings.   Note that if the receiver locale
    inherits its metrics from its parent, then the metrics table will be cloned
    first.

    @returns {Object} receiver
  */
  addMetrics: function(metricsHash) {
    return this.addHashes('metrics', metricsHash);
  },

  _map: { english: 'en', french: 'fr', german: 'de', japanese: 'ja', jp: 'ja', spanish: 'es' },

  /**
    Normalizes the passed language into a two-character language code.
    This method allows you to specify common languages in their full english
    name (i.e. English, French, etc). and it will be treated like their two
    letter code equivalent.

    @param {String} languageCode
    @returns {String} normalized code
  */
  normalizeLanguage: function(languageCode) {
    if (!languageCode) return 'en' ;
    return Locale._map[languageCode.toLowerCase()] || languageCode ;
  },

  // this method is called once during init to walk the installed locales
  // and make sure they know their own names.
  _assignLocales: function() {
    for(var key in this.locales) this.locales[key].prototype.language = key;
  },

  toString: function() {
    if (!this.prototype.language) Locale._assignLocales() ;
    return "Locale["+this.prototype.language+"]" ;
  },

  // make sure important properties are copied to new class.
  extend: function() {
    var ret= SCObject.extend.apply(this, arguments) ;
    ret.addStrings = Locale.addStrings;
    ret.define = Locale.define ;
    ret.options = Locale.options ;
    ret.toString = Locale.toString ;
    return ret ;
  }

}) ;


/**
  This locales hash contains all of the locales defined by SproutCore and
  by your own application.  See the Locale class definition for the
  various properties you can set on your own locales.

  @type Object
*/
Locale.locales = {
  en: Locale.extend({ _deprecatedLanguageCodes: ['English'] }),
  fr: Locale.extend({ _deprecatedLanguageCodes: ['French'] }),
  de: Locale.extend({ _deprecatedLanguageCodes: ['German'] }),
  ja: Locale.extend({ _deprecatedLanguageCodes: ['Japanese', 'jp'] }),
  es: Locale.extend({ _deprecatedLanguageCodes: ['Spanish'] })
};

/**
  This special helper will store the propertyName / hashes pair you pass 
  in the locale matching the language code.  If a locale is not defined 
  from the language code you specify, then one will be created for you 
  with the english locale as the parent.

  @param {String} languageCode
  @param {String} propertyName
  @param {Hash} hashes
  @returns {void}
*/
export const hashesForLocale = function(languageCode, propertyName, hashes) {
  var locale = Locale.localeClassFor(languageCode);
  locale.addHashes(propertyName, hashes);
};

/**
  Just like hashesForLocale, but for methods.

  @param {String} languageCode
  @param {String} propertyName
  @param {Function} method
  @returns {void}
*/
export const methodForLocale = function(languageCode, propertyName, method) {
  var locale = Locale.localeClassFor(languageCode);
  locale.addMethod(propertyName, method);
};

/**
  This special helper will store the strings you pass in the locale matching
  the language code.  If a locale is not defined from the language code you
  specify, then one will be created for you with the english locale as the
  parent.

  @param {String} languageCode
  @param {Object} strings
  @returns {Object} receiver
*/
export const stringsFor = function(languageCode, strings) {
  // get the locale, creating one if needed.
  var locale = Locale.localeClassFor(languageCode);
  locale.addStrings(strings);
  return this ;
};

/**
  Just like stringsFor, but for metrics.

  @param {String} languageCode
  @param {Object} metrics
  @returns {Object} receiver
*/
export const metricsFor = function(languageCode, metrics) {
  var locale = Locale.localeClassFor(languageCode);
  locale.addMetrics(metrics);
  return this;
};


const langloaderCallbacks = new Set();

export const loadLangFiles = function (cb) {
  langloaderCallbacks.add(cb);

  const code = Locale.currentLanguage || 'en';
  const dirname = `${code}.lproj`;
  // Locale.currentLocale
  readyMixin.ready(function () {
    return cb(code, dirname);
  });
};

registerModule('locale', Locale);

// getter and setter for currentLocale to prevent accidental overwriting
let __currentLocale = null;
Object.defineProperty(Locale, 'currentLocale', {
  get: function () {
    return __currentLocale;
  },
  set: function (val) {
    if (val !== undefined && val !== null) {
      __currentLocale = val;
    }
  }
});

/*
Is there a way to get localization as part of the import structure...
Technically, of course. 
it is more, is it possible to provide a way to do this "automagically".
With import() most definitely...

Technically, the best would be to create some register in the app, which can additionally
be filled by some kind of build tool, which registers all the languages, and the files to load.
Then afterwards the auto selection of the browser, or by some other ready mechanism, the language gets loaded
/ imported automatically. 

The current trick to load is to provide a specific export for runtime deps in the form of a function 

a part of the trick can simply be "check for the current folder" + [lang code] + ".lproj" + "strings.js";

something returning a promise?

it doesn't matter what the path is, as long as the import() statement is in the correct file
Technically we could simply require a single import per language:

./en.lproj/en.js

or 
./en.lproj/index.js

export const langs = function (code, dirname) {
  const langFiles = 
}

or

SC.loadLangFiles(async (code, dirname) => {
  await import(`./${dirname}/index.js`);
});
*/


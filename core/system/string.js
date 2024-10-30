// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { $A, none, typeOf } from "./base.js";
import { T_NUMBER, T_STRING } from "./constants.js";
import { Locale } from "./locale.js";
import { error } from "./logger.js";
import { registerRuntimeDep } from "./root.js";

// let Locale;
// registerRuntimeDep('locale', v => {
//   Locale = v;
// });


const STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);
const STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
const STRING_DASHERIZE_REGEXP = (/[ _]/g);
const STRING_TRIM_LEFT_REGEXP = (/^\s+/g);
const STRING_TRIM_RIGHT_REGEXP = (/\s+$/g);
const STRING_CSS_ESCAPED_REGEXP = (/(:|\.|\[|\])/g);
const STRING_HUMANIZE_REGEXP = (/[\-_]/g);
const STRING_REGEXP_ESCAPED_REGEXP = (/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g);


export const diacriticMappingTable = {
  'À':'A', 'Á':'A', 'Â':'A', 'Ã':'A', 'Ä':'A', 'Å':'A', 'Ā':'A', 'Ă':'A',
  'Ą':'A', 'Ǎ':'A', 'Ǟ':'A', 'Ǡ':'A', 'Ǻ':'A', 'Ȁ':'A', 'Ȃ':'A', 'Ȧ':'A',
  'Ḁ':'A', 'Ạ':'A', 'Ả':'A', 'Ấ':'A', 'Ầ':'A', 'Ẩ':'A', 'Ẫ':'A', 'Ậ':'A',
  'Ắ':'A', 'Ằ':'A', 'Ẳ':'A', 'Ẵ':'A', 'Ặ':'A', 'Å':'A', 'Ḃ':'B', 'Ḅ':'B',
  'Ḇ':'B', 'Ç':'C', 'Ć':'C', 'Ĉ':'C', 'Ċ':'C', 'Č':'C', 'Ḉ':'C', 'Ď':'D',
  'Ḋ':'D', 'Ḍ':'D', 'Ḏ':'D', 'Ḑ':'D', 'Ḓ':'D', 'È':'E', 'É':'E', 'Ê':'E',
  'Ë':'E', 'Ē':'E', 'Ĕ':'E', 'Ė':'E', 'Ę':'E', 'Ě':'E', 'Ȅ':'E', 'Ȇ':'E',
  'Ȩ':'E', 'Ḕ':'E', 'Ḗ':'E', 'Ḙ':'E', 'Ḛ':'E', 'Ḝ':'E', 'Ẹ':'E', 'Ẻ':'E',
  'Ẽ':'E', 'Ế':'E', 'Ề':'E', 'Ể':'E', 'Ễ':'E', 'Ệ':'E', 'Ḟ':'F', 'Ĝ':'G',
  'Ğ':'G', 'Ġ':'G', 'Ģ':'G', 'Ǧ':'G', 'Ǵ':'G', 'Ḡ':'G', 'Ĥ':'H', 'Ȟ':'H',
  'Ḣ':'H', 'Ḥ':'H', 'Ḧ':'H', 'Ḩ':'H', 'Ḫ':'H', 'Ì':'I', 'Í':'I', 'Î':'I',
  'Ï':'I', 'Ĩ':'I', 'Ī':'I', 'Ĭ':'I', 'Į':'I', 'İ':'I', 'Ǐ':'I', 'Ȉ':'I',
  'Ȋ':'I', 'Ḭ':'I', 'Ḯ':'I', 'Ỉ':'I', 'Ị':'I', 'Ĵ':'J', 'Ķ':'K', 'Ǩ':'K',
  'Ḱ':'K', 'Ḳ':'K', 'Ḵ':'K', 'Ĺ':'L', 'Ļ':'L', 'Ľ':'L', 'Ḷ':'L', 'Ḹ':'L',
  'Ḻ':'L', 'Ḽ':'L', 'Ḿ':'M', 'Ṁ':'M', 'Ṃ':'M', 'Ñ':'N', 'Ń':'N', 'Ņ':'N',
  'Ň':'N', 'Ǹ':'N', 'Ṅ':'N', 'Ṇ':'N', 'Ṉ':'N', 'Ṋ':'N', 'Ò':'O', 'Ó':'O',
  'Ô':'O', 'Õ':'O', 'Ö':'O', 'Ō':'O', 'Ŏ':'O', 'Ő':'O', 'Ơ':'O', 'Ǒ':'O',
  'Ǫ':'O', 'Ǭ':'O', 'Ȍ':'O', 'Ȏ':'O', 'Ȫ':'O', 'Ȭ':'O', 'Ȯ':'O', 'Ȱ':'O',
  'Ṍ':'O', 'Ṏ':'O', 'Ṑ':'O', 'Ṓ':'O', 'Ọ':'O', 'Ỏ':'O', 'Ố':'O', 'Ồ':'O',
  'Ổ':'O', 'Ỗ':'O', 'Ộ':'O', 'Ớ':'O', 'Ờ':'O', 'Ở':'O', 'Ỡ':'O', 'Ợ':'O',
  'Ṕ':'P', 'Ṗ':'P', 'Ŕ':'R', 'Ŗ':'R', 'Ř':'R', 'Ȑ':'R', 'Ȓ':'R', 'Ṙ':'R',
  'Ṛ':'R', 'Ṝ':'R', 'Ṟ':'R', 'Ś':'S', 'Ŝ':'S', 'Ş':'S', 'Š':'S', 'Ș':'S',
  'Ṡ':'S', 'Ṣ':'S', 'Ṥ':'S', 'Ṧ':'S', 'Ṩ':'S', 'Ţ':'T', 'Ť':'T', 'Ț':'T',
  'Ṫ':'T', 'Ṭ':'T', 'Ṯ':'T', 'Ṱ':'T', 'Ù':'U', 'Ú':'U', 'Û':'U', 'Ü':'U',
  'Ũ':'U', 'Ū':'U', 'Ŭ':'U', 'Ů':'U', 'Ű':'U', 'Ų':'U', 'Ư':'U', 'Ǔ':'U',
  'Ǖ':'U', 'Ǘ':'U', 'Ǚ':'U', 'Ǜ':'U', 'Ȕ':'U', 'Ȗ':'U', 'Ṳ':'U', 'Ṵ':'U',
  'Ṷ':'U', 'Ṹ':'U', 'Ṻ':'U', 'Ụ':'U', 'Ủ':'U', 'Ứ':'U', 'Ừ':'U', 'Ử':'U',
  'Ữ':'U', 'Ự':'U', 'Ṽ':'V', 'Ṿ':'V', 'Ŵ':'W', 'Ẁ':'W', 'Ẃ':'W', 'Ẅ':'W',
  'Ẇ':'W', 'Ẉ':'W', 'Ẋ':'X', 'Ẍ':'X', 'Ý':'Y', 'Ŷ':'Y', 'Ÿ':'Y', 'Ȳ':'Y',
  'Ẏ':'Y', 'Ỳ':'Y', 'Ỵ':'Y', 'Ỷ':'Y', 'Ỹ':'Y', 'Ź':'Z', 'Ż':'Z', 'Ž':'Z',
  'Ẑ':'Z', 'Ẓ':'Z', 'Ẕ':'Z',
  'Þ':'Th',
  '`': '`',
  'à':'a', 'á':'a', 'â':'a', 'ã':'a', 'ä':'a', 'å':'a', 'ā':'a', 'ă':'a',
  'ą':'a', 'ǎ':'a', 'ǟ':'a', 'ǡ':'a', 'ǻ':'a', 'ȁ':'a', 'ȃ':'a', 'ȧ':'a',
  'ḁ':'a', 'ạ':'a', 'ả':'a', 'ấ':'a', 'ầ':'a', 'ẩ':'a', 'ẫ':'a', 'ậ':'a',
  'ắ':'a', 'ằ':'a', 'ẳ':'a', 'ẵ':'a', 'ặ':'a', 'ḃ':'b', 'ḅ':'b', 'ḇ':'b',
  'ç':'c', 'ć':'c', 'ĉ':'c', 'ċ':'c', 'č':'c', 'ḉ':'c', 'ď':'d', 'ḋ':'d',
  'ḍ':'d', 'ḏ':'d', 'ḑ':'d', 'ḓ':'d', 'è':'e', 'é':'e', 'ê':'e', 'ë':'e',
  'ē':'e', 'ĕ':'e', 'ė':'e', 'ę':'e', 'ě':'e', 'ȅ':'e', 'ȇ':'e', 'ȩ':'e',
  'ḕ':'e', 'ḗ':'e', 'ḙ':'e', 'ḛ':'e', 'ḝ':'e', 'ẹ':'e', 'ẻ':'e', 'ẽ':'e',
  'ế':'e', 'ề':'e', 'ể':'e', 'ễ':'e', 'ệ':'e', 'ḟ':'f', 'ĝ':'g', 'ğ':'g',
  'ġ':'g', 'ģ':'g', 'ǧ':'g', 'ǵ':'g', 'ḡ':'g', 'ĥ':'h', 'ȟ':'h', 'ḣ':'h',
  'ḥ':'h', 'ḧ':'h', 'ḩ':'h', 'ḫ':'h', 'ẖ':'h', 'ì':'i', 'í':'i', 'î':'i',
  'ï':'i', 'ĩ':'i', 'ī':'i', 'ĭ':'i', 'į':'i', 'ǐ':'i', 'ȉ':'i', 'ȋ':'i',
  'ḭ':'i', 'ḯ':'i', 'ỉ':'i', 'ị':'i', 'ĵ':'j', 'ǰ':'j', 'ķ':'k', 'ǩ':'k',
  'ḱ':'k', 'ḳ':'k', 'ḵ':'k', 'ĺ':'l', 'ļ':'l', 'ľ':'l', 'ḷ':'l', 'ḹ':'l',
  'ḻ':'l', 'ḽ':'l', 'ḿ':'m', 'ṁ':'m', 'ṃ':'m', 'ñ':'n', 'ń':'n', 'ņ':'n',
  'ň':'n', 'ǹ':'n', 'ṅ':'n', 'ṇ':'n', 'ṉ':'n', 'ṋ':'n', 'ò':'o', 'ó':'o',
  'ô':'o', 'õ':'o', 'ö':'o', 'ō':'o', 'ŏ':'o', 'ő':'o', 'ơ':'o', 'ǒ':'o',
  'ǫ':'o', 'ǭ':'o', 'ȍ':'o', 'ȏ':'o', 'ȫ':'o', 'ȭ':'o', 'ȯ':'o', 'ȱ':'o',
  'ṍ':'o', 'ṏ':'o', 'ṑ':'o', 'ṓ':'o', 'ọ':'o', 'ỏ':'o', 'ố':'o', 'ồ':'o',
  'ổ':'o', 'ỗ':'o', 'ộ':'o', 'ớ':'o', 'ờ':'o', 'ở':'o', 'ỡ':'o', 'ợ':'o',
  'ṕ':'p', 'ṗ':'p', 'ŕ':'r', 'ŗ':'r', 'ř':'r', 'ȑ':'r', 'ȓ':'r', 'ṙ':'r',
  'ṛ':'r', 'ṝ':'r', 'ṟ':'r', 'ś':'s', 'ŝ':'s', 'ş':'s', 'š':'s', 'ș':'s',
  'ṡ':'s', 'ṣ':'s', 'ṥ':'s', 'ṧ':'s', 'ṩ':'s', 'ţ':'t', 'ť':'t', 'ț':'t',
  'ṫ':'t', 'ṭ':'t', 'ṯ':'t', 'ṱ':'t', 'ẗ':'t', 'ù':'u', 'ú':'u', 'û':'u',
  'ü':'u', 'ũ':'u', 'ū':'u', 'ŭ':'u', 'ů':'u', 'ű':'u', 'ų':'u', 'ư':'u',
  'ǔ':'u', 'ǖ':'u', 'ǘ':'u', 'ǚ':'u', 'ǜ':'u', 'ȕ':'u', 'ȗ':'u', 'ṳ':'u',
  'ṵ':'u', 'ṷ':'u', 'ṹ':'u', 'ṻ':'u', 'ụ':'u', 'ủ':'u', 'ứ':'u', 'ừ':'u',
  'ử':'u', 'ữ':'u', 'ự':'u', 'ṽ':'v', 'ṿ':'v', 'ŵ':'w', 'ẁ':'w', 'ẃ':'w',
  'ẅ':'w', 'ẇ':'w', 'ẉ':'w', 'ẘ':'w', 'ẋ':'x', 'ẍ':'x', 'ý':'y', 'ÿ':'y',
  'ŷ':'y', 'ȳ':'y', 'ẏ':'y', 'ẙ':'y', 'ỳ':'y', 'ỵ':'y', 'ỷ':'y', 'ỹ':'y',
  'ź':'z', 'ż':'z', 'ž':'z', 'ẑ':'z', 'ẓ':'z', 'ẕ':'z',
  'þ':'th'
 };

const STRING_DASHERIZE_CACHE = {
  top:      'top',
  left:     'left',
  right:    'right',
  bottom:   'bottom',
  width:    'width',
  height:   'height',
  minWidth: 'min-width',
  maxWidth: 'max-width'
};
  /**
    This finds the value for a key in a formatting string.

    Keys take the form:

        key[:argument to formatter]
  */
const _scs_valueForKey = function (key, data, /* for debugging purposes: */ string) {
  var arg, value, formatter, argsplit = key.indexOf(':');
  if (argsplit > -1) {
    arg = key.substr(argsplit + 1);
    key = key.substr(0, argsplit);
  }

  value = data.get ? data.get(key) : data[key];
  formatter = data[key + 'Formatter'];

  // formatters are optional
  if (formatter) value = formatter(value, arg);
  else if (arg) {
    throw new Error("String.fmt was given a formatting string, but key `" + key + "` has no formatter! String: " + string);
  }

  return value;
};

/**
  Formats a string. You can format either with named parameters or
  indexed, but not both.

  Indexed Parameters
  --------------------
  Indexed parameters are just arguments you pass into format. For example:

      "%@1 %@3 %@2".fmt(1, 2, 3)

      // -> "1 3 2"

  If you don't supply a number, it will use them in the order you supplied. For example:

      "%@, %@".fmt("Iskander", "Alex")

      // -> "Iskander, Alex"

  Named Paramters
  --------------------
  You can use named parameters like this:

      "Value: %{key_name}".fmt({ key_name: "A Value" })

      // -> "Value: A Value"

  You can supply formatters for each field. A formatter is a method to get applied
  to the parameter:

      Currency = function(v) { return "$" + v; };
      "Value: %{val}".fmt({ val: 12.00, valFormatter: Currency })

      // -> $12.00

  Formatters can also use arguments:

      Currency = function(v, sign) { return sign + v; };
      "Value: %{val:£}".fmt({ val: 12.00, valFormatter: Currency })

      // -> £12.00

  You can supply a different formatter for each named parameter. Formatters can ONLY be
  used with named parameters (not indexed parameters).

*/
export const fmt = (string, args) => {
  var i = 0,
    data, hasHadNamedArguments;
  if (args) {
    data = args[0];
  }

  return string.replace(/%\{(.*?)\}/g, function (match, propertyPath) {
    hasHadNamedArguments = true;
    if (!data) {
      throw new Error("Cannot use named parameters with `fmt` without a data hash. String: '" + string + "'");
    }

    var ret = _scs_valueForKey(propertyPath, data, string);
    // If a value was found, return that; otherwise return the original matched text to retain it in the string
    // for future formatting.
    if (!none(ret)) {
      return ret;
    } else {
      return match;
    }
  }).replace(/%@([0-9]+)?/g, function (match, index) {
    if (hasHadNamedArguments) {
      throw new Error("Invalid attempt to use both named parameters and indexed parameters. String: '" + string + "'");
    }
    index = index ? parseInt(index, 10) - 1 : i++;
    if (args[index] !== undefined) return args[index];
    else return "";
  });
};

/**
  Splits the string into words, separated by spaces. Empty strings are
  removed from the results.

  @returns {Array} An array of non-empty strings
*/
export const w = function (str) {
  var ary = [],
    ary2 = str.split(' '),
    len = ary2.length,
    string, idx = 0;
  for (idx = 0; idx < len; ++idx) {
    string = ary2[idx];
    if (string.length !== 0) ary.push(string); // skip empty strings
  }
  return ary;
};

  /**
    Capitalizes a string.

    ## Examples

        capitalize('my favorite items') // 'My favorite items'
        capitalize('css-class-name')    // 'Css-class-name'
        capitalize('action_name')       // 'Action_name'
        capitalize('innerHTML')         // 'InnerHTML'

    @return {String} capitalized string
  */
export const capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
  Camelizes a string.  This will take any words separated by spaces, dashes
  or underscores and convert them into camelCase.

  ## Examples

      camelize('my favorite items') // 'myFavoriteItems'
      camelize('css-class-name')    // 'cssClassName'
      camelize('action_name')       // 'actionName'
      camelize('innerHTML')         // 'innerHTML'

  @returns {String} camelized string
*/
export const camelize = function (str) {
  var ret = str.replace(STRING_TITLEIZE_REGEXP, function (str, separater, character) {
    return character ? character.toUpperCase() : '';
  });

  var first = ret.charAt(0),
    lower = first.toLowerCase();

  return first !== lower ? lower + ret.slice(1) : ret;
};

/**
  Converts a camelized string into all lower case separated by underscores.

  ## Examples

  decamelize('my favorite items') // 'my favorite items'
  decamelize('css-class-name')    // 'css-class-name'
  decamelize('action_name')       // 'action_name'
  decamelize('innerHTML')         // 'inner_html'

  @returns {String} the decamelized string.
*/
export const decamelize = function (str) {
  return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
};

/**
  Converts a camelized string or a string with spaces or underscores into
  a string with components separated by dashes.

  ## Examples

  | *Input String* | *Output String* |
  dasherize('my favorite items') // 'my-favorite-items'
  dasherize('css-class-name')    // 'css-class-name'
  dasherize('action_name')       // 'action-name'
  dasherize('innerHTML')         // 'inner-html'

  @returns {String} the dasherized string.
*/
export const dasherize = function (str) {
  var cache = STRING_DASHERIZE_CACHE,
    ret = cache[str];

  if (ret) {
    return ret;
  } else {
    ret = decamelize(str).replace(STRING_DASHERIZE_REGEXP, '-');
    cache[str] = ret;
  }

  return ret;
};

/**
  Mulitplies a given string. For instance if you have a string "xyz"
  and multiply it by 2 the result is "xyzxyz".

  @param {string} str the string to multiply
  @param {Number} value the number of times to multiply the string
  @returns {string} the mulitiplied string
*/
export const mult = function (str, value) {
  if (typeOf(value) !== T_NUMBER || value < 1) return null;

  var ret = "";
  for (var i = 0; i < value; i += 1) {
    ret += str;
  }

  return ret;
}

/**
  Escapes the given string to make it safe to use as a jQuery selector.
  jQuery will interpret '.' and ':' as class and pseudo-class indicators.

  @see http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/

  @param {String} str the string to escape
  @returns {String} the escaped string
*/
export const escapeCssIdForSelector = function (str) {
  return str.replace(STRING_CSS_ESCAPED_REGEXP, '\\$1');
};

  /**
    Localizes the string.  This will look up the receiver string as a key
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.

    @param str {String} String to localize
    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
export const loc = function (str) {
  // NB: This could be implemented as a wrapper to locWithDefault() but
  // it would add some overhead to deal with the arguments and adds stack
  // frames, so we are keeping the implementation separate.
  if (!Locale.currentLocale) { Locale.createCurrentLocale(); }

  var localized = Locale.currentLocale.locWithDefault(str);
  if (typeOf(localized) !== T_STRING) { localized = str; }

  var args = $A(arguments);
  args.shift(); // remove str param
  //to extend String.prototype
  if (args.length > 0 && args[0] && args[0].isSCArray) { args = args[0]; }

  // I looked up the performance of try/catch. IE and FF do not care so
  // long as the catch never happens. Safari and Chrome are affected rather
  // severely (10x), but this is a one-time cost per loc (the code being
  // executed is likely as expensive as this try/catch cost).
  //
  // Also, .loc() is not called SO much to begin with. So, the error handling
  // that this gives us is worth it.
  try {
    return fmt(localized, args);      
  } catch (e) {
      error("Error processing string with key: " + str);
      error("Localized String: " + localized);
      error("Error: " + e);
  }

};

/**
  Returns the localized metric value for the specified key.  A metric is a
  single value intended to be used in your interface’s layout, such as
  "Button.Confirm.Width" = 100.

  If you would like to return a set of metrics for use in a layout hash, you
  may prefer to use the locLayout() method instead.

  @param {String} key
  @returns {Number} the localized metric
*/
export const locMetric = function (key) {
  let K             = Locale,
      currentLocale = K.currentLocale;

  if (!currentLocale) {
    K.createCurrentLocale();
    currentLocale = K.currentLocale;
  }
  return currentLocale.locMetric(key);
};

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


  For example, if your locale defines:

    Button.Confirm.left
    Button.Confirm.top
    Button.Confirm.right
    Button.Confirm.bottom


  …then these two code snippets will produce the same result:

    layout: {
      left:   "Button.Confirm.left".locMetric(),
      top:    "Button.Confirm.top".locMetric(),
      right:  "Button.Confirm.right".locMetric(),
      bottom: "Button.Confirm.bottom".locMetric()
    }

    layout: "Button.Confirm".locLayout()

  The former is slightly more efficient because it doesn’t have to iterate
  through the possible localized layout keys, but in virtually all situations
  you will likely wish to use the latter.

  @param str {String} key
  @param {str} (optional) additionalHash
  @param {String} (optional) additionalHash
  @returns {Number} the localized metric
*/
export const locLayout = function (key, additionalHash) {
  let K             = Locale,
      currentLocale = K.currentLocale;

  if (!currentLocale) {
    K.createCurrentLocale();
    currentLocale = K.currentLocale;
  }
  return currentLocale.locLayout(key, additionalHash);
};

/**
  Works just like loc() except that it will return the passed default
  string if a matching key is not found.

  @param {String} str the string to localize
  @param {String} def the default to return
  @param {Object...} args optional formatting arguments
  @returns {String} localized and formatted string
*/
export const locWithDefault = function (str, def) {
  if (!Locale.currentLocale) { Locale.createCurrentLocale(); }

  var localized = Locale.currentLocale.locWithDefault(str, def);
  if (typeOf(localized) !== T_STRING) { localized = str; }

  var args = $A(arguments);
  args.shift(); // remove str param
  args.shift(); // remove def param

  return fmt(localized, args);
};



  /**
    Capitalizes every word in a string.  Unlike titleize, spaces or dashes
    will remain in-tact.

    ## Examples

      - **Input String** -> **Output String**
      - my favorite items -> My Favorite Items
      - css-class-name -> Css-Class-Name
      - action_name -> Action_Name
      - innerHTML -> InnerHTML

    @param {String} str String to capitalize each letter2
    @returns {String} capitalized string
  */
export const capitalizeEach = function(str) {
  return str.replace(STRING_TITLEIZE_REGEXP,
    function(subStr, sep, character) {
      return (character) ? (sep + character.toUpperCase()) : sep;
    }).capitalize();
};

/**
  Converts a string to a title.  This will decamelize the string, convert
  separators to spaces and capitalize every word.

  ## Examples

    - **Input String** -> **Output String**
    - my favorite items -> My Favorite Items
    - css-class-name -> Css Class Name
    - action_name -> Action Name
    - innerHTML -> Inner HTML

  @param {String} str String to titleize
  @return {String} titleized string.
*/
export const titleize = function(str) {
  var ret = str.replace(STRING_DECAMELIZE_REGEXP,'$1_$2'); // decamelize
  return ret.replace(STRING_TITLEIZE_REGEXP,
    function(subStr, separater, character) {
      return character ? ' ' + character.toUpperCase() : ' ';
    }).capitalize();
};

/**
  Converts the string into a class name.  This method will camelize your
  string and then capitalize the first letter.

  ## Examples

    - **Input String** -> **Output String**
    - my favorite items -> MyFavoriteItems
    - css-class-name -> CssClassName
    - action_name -> ActionName
    - innerHTML -> InnerHtml

  @param {String} str String to classify
  @returns {String}
*/
export const classify = function(str) {
  var ret = str.replace(STRING_TITLEIZE_REGEXP,
    function(subStr, separater, character) {
      return character ? character.toUpperCase() : '';
    });
  var first = ret.charAt(0), upper = first.toUpperCase();
  return first !== upper ? upper + ret.slice(1) : ret;
};

/**
  Converts a camelized string or a string with dashes or underscores into
  a string with components separated by spaces.

  ## Examples

    - **Input String** -> **Output String**
    - my favorite items -> my favorite items
    - css-class-name -> css class name
    - action_name -> action name
    - innerHTML -> inner html

  @param {String} str String to humanize
  @returns {String} the humanized string.
*/
export const humanize = function(str) {
  return decamelize(str).replace(STRING_HUMANIZE_REGEXP,' ');
};

/**
  Will escape a string so it can be securely used in a regular expression.

  Useful when you need to use user input in a regular expression without
  having to worry about it breaking code if any reserved regular expression
  characters are used.

  @param {String} str String to escape for regex
  @returns {String} the string properly escaped for use in a regexp.
*/
export const escapeForRegExp = function(str) {
  return str.replace(STRING_REGEXP_ESCAPED_REGEXP, "\\$1");
};

/**
  Removes any standard diacritic characters from the string. So, for
  example, all instances of 'Á' will become 'A'.

  @param {String} str String to remove diacritics from
  @returns {String} the modified string
*/
export const removeDiacritics = function(str) {

  var original, replacement, ret = "",
      length = str.length;

  for (var i = 0; i <= length; ++i) {
    original = str.charAt(i);
    replacement = diacriticMappingTable[original];
    ret += replacement || original;
  }
  return ret;
};


/**
  Converts a word into its plural form.

  @param {String} str String to pluralize
  @returns {String} the plural form of the string
*/
export const pluralize = function(str) {
  var inflectionConstants = Locale.currentLocale.inflectionConstants;

  // Fast path if there is no inflection constants for a locale
  if (!inflectionConstants) return str.toString();

  var idx, len,
    compare = str.split(/\s/).pop(), //check only the last word of a string
    restOfString = str.replace(compare,''),
    isCapitalized = compare.charAt(0).match(/[A-Z]/) ? true : false;

  compare = compare.toLowerCase();
  for (idx=0, len=inflectionConstants.UNCOUNTABLE.length; idx < len; idx++) {
    var uncountable = inflectionConstants.UNCOUNTABLE[idx];
    if (compare == uncountable) {
      return str.toString();
    }
  }
  for (idx=0, len=inflectionConstants.IRREGULAR.length; idx < len; idx++) {
    var singular = inflectionConstants.IRREGULAR[idx][0],
        plural   = inflectionConstants.IRREGULAR[idx][1];
    if ((compare == singular) || (compare == plural)) {
      if(isCapitalized) plural = plural.capitalize();
      return restOfString + plural;
    }
  }
  for (idx=0, len=inflectionConstants.PLURAL.length; idx < len; idx++) {
    var regex          = inflectionConstants.PLURAL[idx][0],
      replace_string = inflectionConstants.PLURAL[idx][1];
    if (regex.test(compare)) {
      return str.replace(regex, replace_string);
    }
  }
};

/**
  Converts a word into its singular form.

  @param {String} str String to singularize
  @returns {String} the singular form of the string
*/
export const singularize = function(str) {
  var inflectionConstants = Locale.currentLocale.inflectionConstants;

  // Fast path if there is no inflection constants for a locale
  if (!inflectionConstants) return str.toString();

  var idx, len,
    compare = str.split(/\s/).pop(), //check only the last word of a string
    restOfString = str.replace(compare,''),
    isCapitalized = compare.charAt(0).match(/[A-Z]/) ? true : false;

  compare = compare.toLowerCase();
  for (idx=0, len=inflectionConstants.UNCOUNTABLE.length; idx < len; idx++) {
    var uncountable = inflectionConstants.UNCOUNTABLE[idx];
    if (compare == uncountable) {
      return str.toString();
    }
  }
  for (idx=0, len=inflectionConstants.IRREGULAR.length; idx < len; idx++) {
    var singular = inflectionConstants.IRREGULAR[idx][0],
      plural   = inflectionConstants.IRREGULAR[idx][1];
    if ((compare == singular) || (compare == plural)) {
      if(isCapitalized) singular = singular.capitalize();
      return restOfString + singular;
    }
  }
  for (idx=0, len=inflectionConstants.SINGULAR.length; idx < len; idx++) {
    var regex          = inflectionConstants.SINGULAR[idx][0],
        replace_string = inflectionConstants.SINGULAR[idx][1];
    if (regex.test(compare)) {
      return str.replace(regex, replace_string);
    }
  }
}


  /**
   Removes any extra whitespace from the left edge of the string.

   @returns {String} the trimmed string
  */
export const trimLeft = function (str) {
  return str.replace(STRING_TRIM_LEFT_REGEXP,"");
};

/**
 Removes any extra whitespace from the right edge of the string.

 @returns {String} the trimmed string
*/
export const trimRight = function (str) {
  return str.replace(STRING_TRIM_RIGHT_REGEXP,"");
};



export const SCString = {
  fmt,
  w,
  capitalize,
  camelize,
  decamelize,
  dasherize,
  mult,
  escapeCssIdForSelector,
  loc,
  locMetric,
  locLayout,
  locWithDefault,
  singularize,
  pluralize,
  removeDiacritics,
  escapeForRegExp,
  humanize,
  classify,
  titleize,
  capitalizeEach,
  trimLeft,
  trimRight,
}
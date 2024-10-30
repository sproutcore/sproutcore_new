/*
A set of default settings used throughout the framework
*/

console.log('executing settings');

const settings = {
  debug: false
};

/**
 * Retrieve the current setting value for name
 *
 * @export
 * @param {String} name
 * @returns {any}
 */
export function getSetting(name) {
  return settings[name] || false; // if undefined, return false
}

/**
 * Set the setting by name to value
 *
 * @export
 * @param {String} name
 * @param {Boolean|Number|String} value
 * @param {Boolean} [overWrite] Optional: set to false to prevent overwrite
 * @returns {any}
 */
export function setSetting(name, value, overWrite = true) {
  if (!overWrite) {

  }
  else settings[name] = value;
  return value;
}

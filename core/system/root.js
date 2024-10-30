/**
 * Root is a file we use to become aware of any cyclic dependencies in the framework.
 * 
 */

const ROOT = {

}

const deps = {};

/**
 * This function is used to register a runtime dependency.
 * It uses the ROOT object to store the dependencies.
 * 
 * @param {string} key 
 * @param {any} value 
 */

export const registerRuntimeDep = (key, callback) => {
    console.log('registerRuntimeDep', key);
    if (ROOT[key]) {
        console.log('ROOT has key', key);
        callback(ROOT[key]);
    }
    else {
        console.log('ROOT does not have key', key);
        if (!deps[key]) {
            deps[key] = [];
        }
        deps[key].push(callback);
    
    }
}

// this registers a module in the ROOT object
// the module will be stored in the ROOT object with the key as the name of the module
// and the value as the module itself
// when a module is registered, it will check if the module is registered as a runtime dependency
// if it is, it will use the registered callback function to call the dependent module
export const registerModule = (key, value) => {
    console.log('registerModule', key, value);
    if (value) ROOT[key] = value;
    if (deps[key] && ROOT[key]) {
        deps[key].forEach(callback => {
            callback(ROOT[key]);
        });
    }
}
import { registerModule } from "./root.js";

let env;
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  // huzzah! a worker!
  env = 'worker';
} else {
  env = 'window';
  // I'm a window... sad trombone.
}

// let env;
// if (typeof self !== undefined && global === self) {
//   // main thread
//   env = "worker";
// }
// else if (typeof window !== undefined && global === window) {
//   env = "window";
// }
// // possible for the future...
// // else if (typeof process !== undefined) {
// //   env = "node";
// // }

export const ENV = env;

registerModule('env', env);
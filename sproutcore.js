import { SC as core, GLOBAL } from './core/core.js';
import * as event from './event/event.js';
import * as responder from './responder/responder.js';
import * as statechart from './statechart/statechart.js';
import * as view from './view/view.js';
import * as datastore from './datastore/datastore.js';
import * as desktop from './desktop/desktop.js';
import * as ajax from './ajax/ajax.js';

export { GLOBAL} from './core/core.js';
// this is done as the SC.mixin tries hasOwnProperty which is not present on 
// the imported name spaces

[event, responder, statechart, view, datastore, desktop, ajax].forEach(fw => {
  Object.keys(fw).forEach(k => {
    core[k] = fw[k];
  });
});

export const SproutCore = core;
export const SC = SproutCore;
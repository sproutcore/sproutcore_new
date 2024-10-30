import * as webpack from 'webpack';

// default to make things easier
import prod from './webpack.prod.js';
import dev from './webpack.dev.js';

export default (env, args) => {
  switch (args.mode) {
    case 'development':
      return dev();
    case 'production':
      return prod();
    default:
      return dev();
  }
};

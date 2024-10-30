import { merge } from 'webpack-merge';
import common from './webpack.common.js';

export default (options) => {
  return merge(common(options), {
    mode: 'production',
    devtool: 'hidden-source-map',
  });
};

import path from 'path';
import webpack from 'webpack';


export default () => {
  return {
    mode: "development",
    entry: {
      core: {
        import: "./core/core.js"
      },
      datastore: {
        import: './datastore/datastore.js'
      },
      desktop: {
        import: './desktop/desktop.js'
      },
      event: {
        import: './event/event.js'
      },
      responder: {
        import: './responder/responder.js'
      },
      statechart: {
        import: './statechart/statechart.js',
      },
      view: {
        import: './view/view.js'
      },
      testing: {
        import: './testing/testing.js'
      },
      sproutcore_global: {
        import: "./sproutcore.js",
      },
      
    },
    plugins: [
      // new webpack.ProvidePlugin({
      //   // $: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),
      //   // jQuery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),
      // })
    ],
    devServer: {
      port: 4020,
    }
  }
};
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (options) => {
  return merge(common(options), {
    mode: 'development',
    devServer: {
      static: {
        directory: path.join(__dirname),
        watch: true,
        serveIndex: true,
      },
      compress: true, // enable gzip compression
      hot: true, // hot module replacement
      // server: {
      //   type: 'https',
      //   options: {
      //     key: fs.readFileSync("cert.key"),
      //     cert: fs.readFileSync("cert.crt"),
      //     ca: fs.readFileSync("ca.crt"),
      //   }
      // },
      host: '0.0.0.0',
      allowedHosts: 'all',
      port: 4020,
      setupMiddlewares: (middlewares, devServer) => {
        const app = devServer.app;
        app.get('/testrunner', (req, res) => {
          
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>SproutCore Testrunner</title>
                <link rel="stylesheet" href="tests/qunit/qunit-2.11.3.css">
              </head>
              <body>
                <div id="qunit"></div>
                <div id="qunit-fixture"></div>
                <script src="tests/qunit/qunit-2.11.3.js"></script>
                <script>
                  window.module = QUnit.module;
                  window.test = QUnit.test;
                  window.equals = QUnit.assert.equal;
                  window.same = QUnit.assert.deepEqual;
                  window.ok = QUnit.assert.ok;
                  window.assert = QUnit.assert;
              
                  window.SC = {};
                  // get scriptname from script= parameter
                  const script = new URLSearchParams(window.location.search).get('script');
                  console.log('scriptname is ' + script);
                  // load script
                  const scriptTag = document.createElement('script');
                  scriptTag.type = 'module';
                  scriptTag.src = script;
                  document.body.appendChild(scriptTag);

                  QUnit.done(() => {
                    window.global_test_results = QUnit.config.stats;
                  });
                </script>
              </body>
            </html>
          `;
          res.send(html);
        }); // end app.get
        return middlewares;
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        qunit: 'qunitjs',
      //   // $: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),
      //   // jQuery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),
      })
    ],
  });
};

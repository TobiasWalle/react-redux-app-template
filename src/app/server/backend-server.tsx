import { Server } from 'http';
import * as express from 'express';
import * as path from 'path';
import * as React from 'react';
import { WebServer } from './webpack-dev-server';
import { match } from 'react-router';
import { routes } from '../routes';
import { renderToString } from 'react-dom/server';
import { createStore } from 'redux';
import { createMemoryHistory } from 'react-router';
import { WithStylesContext } from 'isomorphic-style-loader-utils';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { syncHistoryWithStore } from 'react-router-redux';

import { DEVELOPMENT, DISABLE_SERVER_SIDE_RENDERING, RENDER_CSS_ON_CLIENT } from '../utils/config';
import { ApiServer } from '../../api/index';
import { getStoreMiddleware } from '../utils/redux-helper';
import { HtmlComponent } from '../components/html.component';
import { RouterContext } from 'react-router';
import { Provider } from 'react-redux';

// Load main styles as string
const mainStyles = require('../styles/main.scss');

export class BackendServerOptions {
  host?: string = 'localhost';
  port?: number = 3000;
  webpackDevHost?: string = 'localhost';
  webpackDevPort?: number = 3001;
  apiHost?: string = 'localhost';
  apiPort?: number = 3002;
}

export class BackendServer {
  private rootDir = path.resolve();
  private publicPath = path.resolve(this.rootDir + '/dist/client');

  private app: express.Application;
  private proxy: any;

  options: BackendServerOptions;

  httpServer: Server;
  webpackDevServer: any;
  apiServer: ApiServer;

  constructor(
    options: BackendServerOptions,
  ) {
    this.setOptions(options);
  }

  init() {
    this.app = express();

    // Create a proxy for the webpack dev server and the api
    this.proxy = require('http-proxy').createProxyServer();

    // Setup
    this.setupApiRoutes();
    if (DEVELOPMENT) {
      this.setupWebpackDevServerRoutes();
    } else {
      this.setupStaticRoutes();
    }
    this.setupHtmlRoutes();
  }

  setOptions(options: BackendServerOptions) {
    this.options = Object.seal(options);
    this.init();
  }

  setupWebpackDevServerRoutes() {
    this.app.all('/static/*', (req, res) => {
      this.proxy.web(req, res, {
        target: `http://${this.options.webpackDevHost}:${this.options.webpackDevPort}/`,
      });
    });
  }

  setupApiRoutes() {
    this.app.use('/api', (req, res) => {
      this.proxy.web(req, res, {
        target: `http://${this.options.apiHost}:${this.options.apiPort}`,
      });
    });
  }

  setupStaticRoutes() {
    this.app.use('/static', express.static(this.publicPath));
  }

  setupHtmlRoutes() {
    this.app.use((req, res) => {
      // Search for UI Routes
      match({routes, location: req.originalUrl}, (error: any, nextLocation: Location, nextState: any) => {
        if (error) {
          // Send message if an error occurs
          res.status(500).send(error.message);
        } else if (nextLocation) {
          // Redirect on redirection
          res.redirect(302, nextLocation.pathname + nextLocation.search);
        } else if (nextState) {
          // Create history
          const history = createMemoryHistory();

          // Setup state
          const initialState = {};
          const store = createStore(
            require('../modules/root').reducer,
            initialState,
            getStoreMiddleware(history)
          );

          syncHistoryWithStore(history, store);

          if (DISABLE_SERVER_SIDE_RENDERING) {
            // Just provider Html without SSR
            res.status(200).send(renderToString(
              <HtmlComponent store={store}/>,
            ));
          } else {
            // Prepare app
            let RootComponent = () => (
              <Provider store={store}>
                <RouterContext {...nextState}/>
              </Provider>
            );

            // Load styles if configured
            const css: string[] = [];
            if (!RENDER_CSS_ON_CLIENT) {
              console.log('Load main styles');

              // Wrap app with style context
              const OldAppComponent = withStyles(mainStyles)(RootComponent);
              RootComponent = () => (
                <WithStylesContext onInsertCss={styles => css.push(styles._getCss())}>
                  <OldAppComponent/>
                </WithStylesContext>
              );
            }

            // Send the result
            const html = renderToString(
              <HtmlComponent
                store={store}
                component={<RootComponent/>}
                styles={css}
              />,
            );
            res.status(200).send(html);
          }
        } else {
          // No routes where found, send 404
          res.status(404).send('Not found');
        }
      });
    });
  }

  startWebpackDevServer(host = this.options.webpackDevHost, port = this.options.webpackDevPort) {
    this.webpackDevServer = new WebServer(host, port);
    this.webpackDevServer.start();
  }

  startApiServer(host = this.options.apiHost, port = this.options.apiPort) {
    this.apiServer = new ApiServer(host, port);
    this.apiServer.start();
  }

  stopWebpackDevServer() {
    this.webpackDevServer.stop();
  }

  stopApiServer() {
    this.apiServer.stop();
  }

  start() {
    this.httpServer = this.app.listen(this.options.port, () => {
      console.log(`Server is running on ${this.options.host}:${this.options.port}/`);
    });
  }

  stop() {
    console.log('Stop Backend Server');
    this.httpServer.close();
  }
}

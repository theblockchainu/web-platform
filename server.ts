// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
const https = require('https');
const sslConfig = require('./ssl-config');

import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';
import { ngExpressEngine } from '@nguniversal/express-engine';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 8080;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [
        provideModuleMap(LAZY_MODULE_MAP)
    ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
app.get('*', function (req, res) {
    console.log('requestrecieved');
    res.render(join(DIST_FOLDER, 'browser', 'index.html'), { req });
});

const options = {
	key: sslConfig.privateKey,
	cert: sslConfig.certificate,
};
let server = null;
server = https.createServer(options, app);

// Start up the Node server
server.listen(PORT, () => {
    console.log(`Node server listening on https://localhost:${PORT}`);
});

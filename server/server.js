'use strict';

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const util = require('util');
const net = require('net');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const socketio = require('socket.io');
const WiFi = require ('./wifi');

const PORT = 80;
const PORTS = 443;
//const BIND = '10.99.0.1';
const BIND = '0.0.0.0';
const STATIC_DIR = __dirname + '/../static';
const CLIENT_DIR = __dirname + '/../client';


async function init() {
    let app = express();
    app.use((req, res, next) => {
	if (req.url !== '/ping') {
	    console.log(req.method, req.url);
	}
	next();
    });

    //app.use(bodyParser.json({ type: 'application/*+json' }))
    app.use(bodyParser.json({ type: 'application/json' }))
    app.use(bodyParser.urlencoded({ type: 'application/x-www-form-urlencoded', extended: true }));
    app.use(bodyParser.text({ type: 'text/plain' }))
    app.use(serveStatic(STATIC_DIR));

    let wifi = new WiFi();
    wifi.init(app,
        (err) =>
            {
                if (err) {
                    console.error(err);
                } else {
                    console.log('wifi listening');
                }
            });

    if (process.env.NODE_ENV !== 'production') {
	let Bundler = require('parcel-bundler');
	let bundler = new Bundler(CLIENT_DIR + '/index.html', { outDir: STATIC_DIR });
	app.use(bundler.middleware());  // does not play well with others, must come last
    }

    let server = http.createServer(app);

    server.listen(PORT, BIND, () => {
	console.log(`server started on port ${PORT}`);
    });

    // let key = fs.readFileSync('certs/server.key');
    // let cert = fs.readFileSync('certs/server.crt');

    // let serverS = https.createServer({ key, cert }, app);

    // serverS.listen(PORTS, BIND, () => {
    // 	console.log(`server started on port ${PORTS}`);
    // });

    //let io = new socketio(server);
}


module.exports.init = init;

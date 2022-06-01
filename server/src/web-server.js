'use strict';

const fs = require('fs');
const fsP = require('fs').promises;
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
const CLIENT_DIR = __dirname + '/../../client/build';
const STATIC_DIR = __dirname + '/../../static';


class WebServer {
    async init() {
	let app = express();
	app.use((req, res, next) => {
	    //if (req.url !== '/ping') {
	    console.log(req.method, req.url);
	    //}
	    next();
	});

	//app.use(bodyParser.json({ type: 'application/*+json' }))
	app.use(bodyParser.json({ type: 'application/json' }))
	app.use(bodyParser.urlencoded({ type: 'application/x-www-form-urlencoded', extended: true }));
	app.use(bodyParser.text({ type: 'text/plain' }))

	let wifi = new WiFi();
	wifi.init(app, (err) => {
            if (err) {
		console.error(err);
            } else {
		console.log('wifi listening');
            }
	});

	if (process.env.NODE_ENV == 'production') {
	    app.use(serveStatic(CLIENT_DIR));
	} else {
	    const { createProxyMiddleware } = require('http-proxy-middleware');
	    let sveltekit_dev_server = createProxyMiddleware({
		target: 'http://localhost:3000',
		ws: true,
		changeOrigin: true
	    });
	    app.get('*', sveltekit_dev_server);
	    app.use(serveStatic(STATIC_DIR));  // really?
	}

	let server = http.createServer(app);
	let io = socketio(server);

	server.listen(PORT, BIND, () => {
	    console.log(`server started on port ${PORT}`);
	});

	// let key = fs.readFileSync('certs/server.key');
	// let cert = fs.readFileSync('certs/server.crt');
	// let serverS = https.createServer({ key, cert }, app);
	// serverS.listen(PORTS, BIND, () => {
	// 	console.log(`server started on port ${PORTS}`);
	// });
    }
}


module.exports = WebServer;

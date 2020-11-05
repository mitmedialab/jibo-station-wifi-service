'use strict';
const fs = require('fs').promises;
const path = require('path');
const net = require('net');
const http = require('http');
const connect = require('connect');
const bodyParser = require('body-parser');
const Router = require('router');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const child_process = require('child_process');
const util = require('util');
//const WifiHandler = require('node-wifi-handler');
//const WpaCli = require('wpa-wifi');
const {Wireless, Monitor} = require('wirelesser');

const log = console;
const PORT = 80;
const INTERFACE = 'wlan1';


async function init() {
    let wifi = new WiFi();

    wifi.init(
        (err) =>
            {
                if (err) {
                    log.error(err);
                } else {
                    log.info('wifi listening');
                }
            });
}


class WiFi {
    constructor() {
    }


    init(callback) {
        this.app = connect();

	this.wireless = new Wireless(INTERFACE);
	this.monitor = new Monitor(INTERFACE);
	this.monitor.on('data', data => {
	    console.log('data', data);
	});
	this.monitor.on('control', (control, args) => {
	    console.log('control', control, args);
	});

	this.app.use(bodyParser.json());
	this.app.use(bodyParser.urlencoded({ extended: false }));
        this.router = new Router();
        this.routes(this.router);
        this.app.use(this.router);

        this.staticDir = path.join(__dirname, 'static');
        this.app.use(serveStatic(this.staticDir));  // html and friends

        let httpOptions = {};
        this.server = http.createServer(httpOptions, this.app);

        this.hostname = '10.99.0.1';
        this.server.listen(PORT, this.hostname, callback);

	//this.wpa = new WpaCli('wlan1');
	//wpa.on('ready', () => {
	//    console.log('wpa ready');
	//    console.log(wpa.listNetworks());
	//});
    }


    routes(router) {
	router.get('/status', async (req, res) => {
	    let data = await this.wireless.status()
	    let json = JSON.stringify(data);
	    res.setHeader('Content-Type', 'application/json');
	    res.end(json);
	});

    	router.get('/scan', async (req, res) => {
	    //let timestamp = Number(new Date());
	    let data = await this.wireless.scan()
	    //let elapsed = Number(new Date()) - timestamp;
	    //console.log('scan elapsed', elapsed);
	    let json = JSON.stringify(data);
	    res.setHeader('Content-Type', 'application/json');
	    res.end(json);
	});

    	router.get('/signal', async (req, res) => {
	    let timestamp = Number(new Date());
	    let data = {};
	    try {
		//data = await this.wireless.exec('signal_poll');
	    } catch(err) {
		console.error(err);
	    }
	    let elapsed = Number(new Date()) - timestamp;
	    console.log('scan elapsed', elapsed);
	    //console.log(data);
	    let json = JSON.stringify(data);
	    res.setHeader('Content-Type', 'application/json');
	    res.end(json);
	});

	router.post('/disconnect', async (req, res) => {
	    console.log('disconnect');
	    res.setHeader('Content-Type', 'application/json');
	    res.end('{}');
	});

	router.post('/connect', async (req, res) => {
	    console.log('connect', req.body);
	    let result = await this.wireless.connect(req.body.ssid, req.body.password);
	    console.log('result', result);
	    res.setHeader('Content-Type', 'application/json');
	    res.end('{}');
	});
    }
}


module.exports.init = init;

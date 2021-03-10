'use strict';
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const net = require('net');
const http = require('http');
const connect = require('connect');
const Router = require('router');
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const child_process = require('child_process');
const {Wireless, Monitor} = require('wirelesser');
const nmcli = require('./nmcli');

const PORT = 80;
const INTERFACE = process.argv[2] || 'wlan1';  // node index.js <INTERFACE>
//const USE_NM = (os.arch() === 'x64');  // assuming x86 = Ubuntu, otherwise Rasbian
const USE_NM = false;


async function init() {
    if (USE_NM) {
	console.log('using nmcli');
    } else {
	console.log('using wpa_cli');
    }
    let wifi = new WiFi();
    wifi.init(
        (err) =>
            {
                if (err) {
                    console.error(err);
                } else {
                    console.log('wifi listening');
                }
            });
}


class WiFi {
    constructor() {
    }

    init(callback) {
        this.app = connect();

        this.wireless = new Wireless(INTERFACE);
        //this.monitor = new Monitor(INTERFACE);
        //this.monitor.on('data', data => {
        //    console.log('data', data);
        //});
        //this.monitor.on('control', (control, args) => {
        //    console.log('control', control, args);
        //});

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
    }


    routes(router) {
        router.get('/status', async (req, res) => {
            let json = '{}';
            try {
                let data = await this.wireless.status()
                json = JSON.stringify(data);
            } catch(err) {
                console.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });

        router.get('/scan', async (req, res) => {
            let json = '{}';
            try {
                let data = await this.wireless.scan()
                json = JSON.stringify(data);
            } catch(err) {
                console.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });

        router.get('/signal', async (req, res) => {
            let json = '{}';
            try {
                let data = await this.wireless.exec('signal_poll');
                json = JSON.stringify(data);
            } catch(err) {
                console.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });

        router.post('/connect', async (req, res) => {
            let json = '{}';
            try {
                console.log('connect', req.body);
                let data = await this.connectToWiFi(req.body.ssid, req.body.password);
                json = JSON.stringify(data);
                console.log('result', data);
            } catch(err) {
                console.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });
    }


    async connectToWiFi(ssid, password) {
	if (USE_NM) {
	    let result = await nmcli.connect(ssid, password);
	    console.log('result', result);
	} else {
	    this.wireless.connect(ssid, password);  // TODO this isn't right
	}
    }
}


module.exports.init = init;

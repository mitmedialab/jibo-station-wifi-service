'use strict';

const os = require('os');
const child_process = require('child_process');
const {Wireless, Monitor} = require('wirelesser');
//const nmcli = require('./nmcli');

const INTERFACE = process.argv[2] || 'wlan1';  // node index.js <INTERFACE>
const USE_NM = (os.arch() === 'x64');  // assuming x86 = Ubuntu, otherwise Rasbian

class WiFi {
    constructor() {
    }

    init(app, callback) {
        //this.app = connect();
        this.app = app;

        this.wireless = new Wireless(INTERFACE);
        //this.monitor = new Monitor(INTERFACE);
        //this.monitor.on('data', data => {
        //    console.log('data', data);
        //});
        //this.monitor.on('control', (control, args) => {
        //    console.log('control', control, args);
        //});

        this.router = app;
        this.routes(this.router);
    }


    routes(router) {
        router.get('/status', async (req, res) => {
            let json = '{}';
            //try {
            //    let data = await this.wireless.status()
            //    json = JSON.stringify(data);
            //} catch(err) {
            //    console.error(err);
            //}
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

module.exports = WiFi;

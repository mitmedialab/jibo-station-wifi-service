'use strict';

const os = require('os');
const child_process = require('child_process');
const { Wireless, Monitor } = require('wirelesser');
const isOnline = require('is-online');
const isTcpOn = require('is-tcp-on');

const INTERFACE = process.argv[2] || 'wlan1';  // node index.js <INTERFACE>
const ROVER_INTERFACE = 'tun0';
//const USE_NM = (os.arch() === 'x64');  // assuming x86 = Ubuntu, otherwise Rasbian
const USE_NM = false;  // dear god, i hope we are rid of NetworkManager -jon

const SERVER_TEST_ADDRESS = 'prg-webhost.media.mit.edu';
const SERVER_TEST_PORT = 80;

const timeoutP = function(ms) {
    return new Promise( (resolve) => setTimeout(resolve, ms) );
}

let log = console;


class WiFi {
    constructor() {
    }

    init(app, callback) {
        //this.app = connect();
        this.app = app;

        this.wireless = new Wireless(INTERFACE);
        //this.monitor = new Monitor(INTERFACE);
        //this.monitor.on('data', data => {
        //    log.log('data', data);
        //});
        //this.monitor.on('control', (control, args) => {
        //    log.log('control', control, args);
        //});

        this.router = app;
        this.routes(this.router);
    }


    routes(router) {
        router.get('/ping', async (req, res) => {
            let json = JSON.stringify({ ping: true });
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });

	router.post('/debug', async (req, res) => {
            log.log('client debug', req.body);
	    res.end();
	});

        router.get('/status', async (req, res) => {
            let json = '{}';
            try {
                let data = await this.getStatus()
                json = JSON.stringify(data);
            } catch(err) {
                log.error(err);
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
                log.error(err);
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
                log.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });

        router.post('/connect', async (req, res) => {
            let json = '{}';
            try {
                log.log('connect', req.body);
                let data = await this.connectToWiFi(req.body.ssid, req.body.password);
                json = JSON.stringify(data);
                log.log('result', data);
            } catch(err) {
                log.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });

        router.post('/disconnect', async (req, res) => {
            let json = '{}';
            try {
                log.log('disconnect', req.body);
                let data = await this.disconnectWiFi(req.body.ssid, req.body.password);
                json = JSON.stringify(data);
                log.log('result', data);
            } catch(err) {
                log.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });
    }


    async getStatus() {
        let data = await this.wireless.status();
	let state = data.wpa_state;
	data.hostname = os.hostname();
	if (state === 'COMPLETED') {
	    if (this.last_state !== state) {
		this.last_state = state;
		this.phase = 0;
	    }

	    if (this.phase < 1) {
		this.phase++;
	    } else {
		data.ip_address = await this.determineIPAddress();
		data.rover_ip_address = await this.determineRoverIPAddress();
		data.jibo_connected = await this.isJiboConnected();
		if (data.jibo_connected) {
		    if (this.phase < 2) {
			this.phase++;
		    } else {
			data.internet_connected = await this.isInternetConnected();
			if (this.phase < 3) {
			    this.phase++;
			} else {
			    if (data.internet_connected) {
				data.server_connected = await this.isServerConnected();
			    }
			}
		    }
		}
	    }
	}

	return data;
    }


    async determineIPAddress() {
	let interfaces = os.networkInterfaces();
	if (interfaces[INTERFACE]) {
	    for (let address of interfaces[INTERFACE]) {
		if (address.family === 'IPv4') {
		    return address.address;
		}
	    }
	}
	return undefined;
    }


    async determineRoverIPAddress() {
	let interfaces = os.networkInterfaces();
	if (interfaces[ROVER_INTERFACE]) {
	    for (let address of interfaces[ROVER_INTERFACE]) {
		if (address.family === 'IPv4') {
		    return address.address;
		}
	    }
	}
	return undefined;
    }


    async isJiboConnected() {
	await timeoutP(1000);
	return true;  // FIXME
    }


    async isInternetConnected() {
	await timeoutP(1000);
	return await isOnline({timeout:2000});
    }


    async isServerConnected() {
	let options = 
	{
	    host: SERVER_TEST_ADDRESS,
	    port: SERVER_TEST_PORT,
	    timeout: 3000 // optional, default is 1000ms
	};
	try {
	    await isTcpOn(options);
	    return true;
	} catch {
	    return false;
	}
    }


    async connectToWiFi(ssid, password) {
	if (USE_NM) {
	    let result = await nmcli.connect(ssid, password);
	    log.log('result', result);
	} else {
	    this.wireless.connect(ssid, password);  // TODO this isn't right
	}
    }


    async disconnectWiFi(ssid, password) {
	if (USE_NM) {
	    let result = await nmcli.disconnect();
	    log.log('result', result);
	} else {
	    this.wireless.disconnect();  // TODO this isn't right
	}
    }
}

module.exports = WiFi;

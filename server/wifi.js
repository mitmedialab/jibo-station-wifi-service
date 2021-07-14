'use strict';

const os = require('os');
const fsP = require('fs').promises;
const child_process = require('child_process');
const { Wireless, Monitor } = require('wirelesser');
const isOnline = require('is-online');
const isTcpOn = require('is-tcp-on');

const INTERFACE = process.argv[2];  // node index.js <INTERFACE>
if (!INTERFACE) {
    console.error(process.argv[1], 'Error: must specify interface as first argument');
    process.exit();
}
const ROVER_INTERFACE = 'tun0';
//const USE_NM = (os.arch() === 'x64');  // assuming x86 = Ubuntu, otherwise Rasbian
const USE_NM = false;  // dear god, i hope we are rid of NetworkManager -jon
const SERVER_TEST_ADDRESS = 'prg-webhost.media.mit.edu';
const SERVER_TEST_PORT = 80;
const DHCP_LEASES_FILE = '/var/lib/misc/dnsmasq.leases';
const SSH_TCP_PORT = 22;
const STATIC_DIR = __dirname + '/../static';

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

	router.get('/b', async (req, res) => {
	    console.log('making bookmark');
            let text = await this.getBookmarkDataURL();
            res.setHeader('Content-Type', 'text/plain');
            res.end(text);
        });

	router.post('/debug', async (req, res) => {
            log.log('client debug', req.body);
	    res.end();
	});

	router.post('/reboot', async (req, res) => {
            log.log('rebooting!');
	    child_process.exec('reboot');
	    res.end();
	});

        router.get('/status', async (req, res) => {
            let json = '{}';
            try {
		let reset_phase = false;
		if (req.query.first) {
		    console.log('resetting phase');
		    reset_phase = true;
		}
                let data = await this.getStatus(reset_phase);
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
                log.log('disconnect');
                let data = await this.disconnectWiFi();
                json = JSON.stringify(data);
                log.log('result', data);
            } catch(err) {
                log.error(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        });
    }

    async getBookmarkDataURL() {
	let html = await fsP.readFile(STATIC_DIR + '/ping.html', 'utf8');
	let buffer = Buffer.from(html, 'utf8');
	let base64 = buffer.toString('base64');
	//console.log('base64', base64);
	return `data:text/html;base64,${base64}`;
    }


    async getStatus(reset_phase) {
        let data = await this.wireless.status();
	let state = data.wpa_state;
	data.hostname = os.hostname();
	if (state === 'COMPLETED') {
	    if (this.last_state !== state) {
		this.last_state = state;
		this.phase = 0;
	    }
	    if (reset_phase) {
		this.phase = 0;
	    }

	    if (this.phase < 1) {
		this.phase++;
	    } else {
		data.ip_address = await this.determineIPAddress();
		data.rover_ip_address = await this.determineRoverIPAddress();
		if (this.phase === 1) {
		    await timeoutP(1000);
		}
		data.dhcp_leases = await this.readDHCPLeases();
		let jibo_ip = await this.isJiboConnected(data.dhcp_leases);
		if (jibo_ip) {
		    data.jibo_connected = true;
		    data.jibo_ip_address = jibo_ip;
		} else {
		    data.jibo_connected = false;
		}
		//if (data.jibo_connected) {
		    if (this.phase < 2) {
			this.phase++;
		    } else {
			let giveittime = false;
			if (this.phase ===2) {
			    await timeoutP(1000);
			    giveittime = true;
			}
			data.internet_connected = await this.isInternetConnected(giveittime);
			if (this.phase < 3) {
			    this.phase++;
			} else {
			    if (data.internet_connected) {
				data.server_connected = await this.isServerConnected();
			    }
			}
		    }
		//}
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


    async readDHCPLeases() {
	let file = await fsP.readFile(DHCP_LEASES_FILE, 'utf8');
	let lines = file.split('\n');
	let leases = [];
	// 1625727703 dc:f7:56:e1:c4:3e 10.99.0.8 Galaxy-Tab-A-2016 01:dc:f7:56:e1:c4:3e
	// 1625735625 f8:ff:c2:38:76:3c 10.99.0.4 Jons-MBP 01:f8:ff:c2:38:76:3c
	// 1625738341 f0:c7:7f:95:72:79 10.99.0.5 * 01:f0:c7:7f:95:72:79
	// 1625731234 52:01:13:1f:df:8e 10.99.0.13 JiboStation24 01:52:01:13:1f:df:8e
	for (let line of lines) {
	    let lease = line.split(' ');
	    //if (!lease) continue;
	    //if (!lease[0]) continue;
	    //lease[0] = new Date(Number(lease[0]) * 1000).toISOString().split('.')[0];
	    leases.push(lease);
	}
	return leases;
    }


    async isJiboConnected(leases) {
	//await timeoutP(500);  // don't do it *too* quickly
	// just look for anything that has the ssh port open
	for (let lease of leases) {
	    // 1625738341 f0:c7:7f:95:72:79 10.99.0.5 * 01:f0:c7:7f:95:72:79
	    let ip = lease[2];
	    if (ip) {
		let options = 
		    {
			host: ip,
			port: SSH_TCP_PORT,
			timeout: 1000
		    };
		try {
		    await isTcpOn(options);
		    console.log(ip, 'yes');
		    return ip;
		} catch {
		    console.log(ip, 'no');
		    // not that one
		}
	    }
	}
	return false;
    }


    async isInternetConnected(giveittime) {
	let interval = 4 + 1000;
	if (giveittime) {
	    interval = 12 * 1000;
	}
	let done = false;
	let timeout = setTimeout( () => { done = true; }, interval );
	while (!done) {
	    if (await isOnline({timeout:2000})) {
		done = true;
		clearTimeout(timeout);
		return true
	    }
	    await timeoutP(500);
	}
	clearTimeout(timeout);
	return false;
    }


    async isServerConnected() {
	let options = 
	{
	    host: SERVER_TEST_ADDRESS,
	    port: SERVER_TEST_PORT,
	    timeout: 5000 // optional, default is 1000ms
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
	    await this.disableAll();
	    await this.wireless.connect(ssid, password);
	    await this.wireless.saveConfiguration();
	}
    }


    async disconnectWiFi() {
	if (USE_NM) {
	    let result = await nmcli.disconnect();
	    log.log('result', result);
	} else {
	    await this.disableAll();
	    await this.wireless.disconnect();
	    await this.wireless.saveConfiguration();
	}
    }


    async disableAll() {
	if (USE_NM) {
	    // FIXME only if we ever go back to using NM again
	} else {
	    let networks = await this.wireless.listNetworks();
	    for (let network of networks) {
		if (!network.ssid) {
		    console.log(`removing network without ssid ${network.id}`);
		    await this.wireless.removeNetwork(network.id);
		} else {
		    console.log(`disabling network ${network.id}`);
		    await this.wireless.disableNetwork(network.id);
		}
	    }
	}
    }
}

module.exports = WiFi;

'use strict';

const os = require('os');
const child_process = require('child_process');
const {Wireless, Monitor} = require('wirelesser');

const INTERFACE = process.argv[2] || 'wlan1';  // node index.js <INTERFACE>
const USE_NM = (os.arch() === 'x64');  // assuming x86 = Ubuntu, otherwise Rasbian

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

        // this.app.use(bodyParser.json());
        // this.app.use(bodyParser.urlencoded({ extended: false }));
        // this.router = new Router();
        this.router = app;
        this.routes(this.router);
        // this.app.use(this.router);

        // this.staticDir = path.join(STATIC_DIR);
        // this.app.use(serveStatic(this.staticDir));  // html and friends

        // let httpOptions = {};
        // this.server = http.createServer(httpOptions, this.app);

        // this.hostname = '10.99.0.1';
        // this.server.listen(PORT, this.hostname, callback);
    }


    routes(router) {
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
    }


    async getStatus() {
        let data = await this.wireless.status();
	data.ip_address = await this.determineIPAddress();
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


    async connectToWiFi(ssid, password) {
	if (USE_NM) {
	    let result = await nmcli.connect(ssid, password);
	    log.log('result', result);
	} else {
	    this.wireless.connect(ssid, password);  // TODO this isn't right
	}
    }
}

module.exports = WiFi;

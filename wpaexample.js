'use strict';

const WpaCtrl = require('wpa-ctrl');
let wpa = new WpaCtrl('wlx9cefd5faa83a');

wpa.on('raw_msg', function(msg) {
    console.log(msg);
});

(async function connectToWiFi() {
    try {
	await wpa.connect()
	console.log('ready');

	let networks = await wpa.listNetworks();
	console.log(networks);

	let accessPoints = await wpa.scan();
	console.log(accessPoints);

	let newNetwork = await wpa.addNetwork();
	await wpa.setNetworkSSID(newNetwork, 'ssid');
	await wpa.setNetworkPreSharedKey(newNetwork, 'password');
	await wpa.selectNetwork(newNetwork);
	wpa.close();
    } catch (err) {
	console.log(err);
    }
})();

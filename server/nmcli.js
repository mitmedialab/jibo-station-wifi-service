'use strict';
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);


async function connect(ssid, password) {
    let command = 'nmcli';
    let args = ['device', 'wifi', 'connect', ssid];
    if (password) {
	args.push('password', password);
    }
    const { stdout } = await execFile(command, args);
    console.log('stdout', stdout);
}


exports.connect = connect;

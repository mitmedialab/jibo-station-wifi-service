'use strict';

const WebServer = require('./web-server.js');


main();

async function main() {
    let webServer = new WebServer();
    await webServer.init();
}

'use strict';

const server = require('./server.js');

main();

async function main() {
    await server.init();
}

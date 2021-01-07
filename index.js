'use strict';

const server = require('./src/server.js');

main();

async function main() {
    await server.init();
}

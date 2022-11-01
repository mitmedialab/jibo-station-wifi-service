'use strict';

const fsP = require('fs').promises;
const util = require('util');
const child_process = require('child_process');

const timeoutP = function(ms) {
    return new Promise( (resolve) => setTimeout(resolve, ms) );
}

let log = console;


const GST_LAUNCH_EXECUTABLE = '/usr/bin/gst-launch-1.0';

// one loopback
const GST_LAUNCH_STRING = '-e v4l2src device=/dev/video0 do-timestamp=true ! queue ! videorate ! video/x-raw,width=640,height=360,framerate=15/1 ! videoconvert ! v4l2sink device=/dev/video7';

// two loopbacks
//const GST_LAUNCH_STRING = '-e v4l2src device=/dev/video0 do-timestamp=true ! queue ! tee name=t ! videorate ! video/x-raw,width=640,height=360,framerate=15/1 ! videoconvert ! v4l2sink device=/dev/video7 t. ! videorate ! video/x-raw,width=640,height=360,framerate=15/1 ! videoconvert ! v4l2sink device=/dev/video8';

const GST_LAUNCH_ARGS = GST_LAUNCH_STRING.split(' ');


class Loopback {
    constructor() {
    }

    init(app, callback) {
        this.routes(app);
    }


    routes(app) {
        app.get('/loopback/on', async (req, res) => {
	    try {
		this.loopback_on();
		let json = JSON.stringify({status: true});
		res.setHeader('Content-Type', 'application/json');
		res.end(json);
	    } catch(err) {
		res.status(400).end(`${err}`);
	    }
        });

        app.get('/loopback/off', async (req, res) => {
	    try {
		this.loopback_off();
		let json = JSON.stringify({status: true});
		res.setHeader('Content-Type', 'application/json');
		res.end(json);
	    } catch(err) {
		res.status(400).end(`${err}`);
	    }
        });
    }

    loopback_on() {
	if (this.child) {
	    throw new Error('loopback was already on');
	}

        let opts = {
	    detached: true,
	    //uid: 1001 or 1000  // might be needed for pulseaudio?
	};

        this.child = child_process.spawn(GST_LAUNCH_EXECUTABLE, GST_LAUNCH_ARGS, opts);

        let child_says = (data) => {
	    log.log('gst-launch-1.0: ' + data);
        };
        this.child.stdout.on('data', child_says);
        this.child.stderr.on('data', child_says);

        this.child.on('exit', (code, signal) => {
	    delete this.child;
	    log.log(`gst-launch-1.0 exited with code ${code}`);
	    if (signal) {
                log.log(`...and signal ${signal}`);
                return;
	    }
        });
    }
	
    loopback_off() {
	if (!this.child) {
	    throw new Error('loopback was not on');
	}

	this.child.kill();
	delete this.child;
    }
}

module.exports = Loopback;

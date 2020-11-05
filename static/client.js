'use strict'

window.client = window.client || {};

const status_request = new Request('/status')
const scan_request = new Request('/scan')
const signal_request = new Request('/signal')


const STATUS_INTERVAL = 1 * 1000;  // 1 second
const SCAN_INTERVAL = 5 * 1000;  // 5 seconds
const SIGNAL_INTERVAL = 1 * 1000;  // 1 second

async function monitorStatus() {
    let statusdiv = document.querySelector('#statusdiv');
    let json;
    try {
        let response = await fetch(status_request);
        json = await response.json();
	console.log('json', json);
	if (json.retry) {
	    return false;
	}
    } catch (e) {
        console.error(e);
	return false;
    }

    console.log(json);
    statusdiv.innerHTML = JSON.stringify(json);
    let connectiondiv = document.querySelector('#connection');
    if (json.ssid) {
	connectiondiv.innerHTML = json.ssid + ` &nbsp; <button onclick="fetch(new Request('/disconnect',{method:'POST'}))">❌</button>`;
    } else {
	connectiondiv.innerHTML = '<i>not connected</i>';
    }
    //if (onair) {
    //    document.body.classList.add('onair');
    //} else {
    //    document.body.classList.remove('onair');
    //}
    //for (let i=0; i<shownames.length; i++) {
    //    shownames[i].innerHTML = show || '';
    //}
    return true;
}


async function monitorScan() {
    let scandiv = document.querySelector('#scandiv');
    let json;
    try {
        let response = await fetch(scan_request);
        json = await response.json();
	if (json.retry) {
	    return false;
	}
    } catch (e) {
        console.error(e);
	return false;
    }

    scandiv.innerHTML = JSON.stringify(json);
    return true;
}


async function monitorSignal() {
    let signaldiv = document.querySelector('#signaldiv');
    let json;
    try {
        let response = await fetch(signal_request);
        json = await response.json();
	if (json.retry) {
	    return false;
	}
    } catch (e) {
        console.error(e);
	return false;
    }

    signaldiv.innerHTML = JSON.stringify(json);
    return true;
}


async function init() {
    //document.body.classList.add('horizontal-mode');
    
    let form = document.getElementById('connect');
    form.addEventListener('submit', connect);

    setInterval(function() {
	let working = monitorStatus();
    }, STATUS_INTERVAL);
    setInterval(function() {
	let working = monitorScan();
    }, SCAN_INTERVAL);
    setInterval(function() {
	let working = monitorSignal();
    }, SIGNAL_INTERVAL);
}


function toggle_body_class(classname) {
    if (document.body.classList.contains(classname)) {
	document.body.classList.remove(classname);
    } else {
	document.body.classList.add(classname);
    }
}


function reset_scroll(id) {
    let div = document.getElementById(id);
    if (div) {
	div.scrollTop = 0;
	div.focus();
    }
}


async function connect(event) {
    console.log(event);
    console.log(event.target);
    event.preventDefault();

    let formdata = new FormData(event.target);
    console.log(formdata);
    console.log(formdata.get('ssid'));
    console.log(formdata.get('password'));

    let json = {
	ssid: formdata.get('ssid'),
	password: formdata.get('password')
    };
    await fetch('/connect', {
	method: 'POST',
	body: JSON.stringify(json),
	headers: {
	    'Content-Type': 'application/json'
	}
    });
    //await fetch(new Request('/connect',{method:'POST',body:formdata}))
}


window.client.init = init;
window.client.connect = connect;

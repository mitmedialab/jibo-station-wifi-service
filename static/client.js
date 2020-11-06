'use strict';

window.client = window.client || {};

const status_request = new Request('/status');
const scan_request = new Request('/scan');
const signal_request = new Request('/signal');


const STATUS_INTERVAL = 1 * 1000;  // 1 second
const SCAN_INTERVAL = 5 * 1000;  // 5 seconds
const SIGNAL_INTERVAL = 1 * 1000;  // 1 second

async function monitorStatus() {
    try {
        let response = await fetch(status_request);
        let json = await response.json();
	if (json && !json.retry && Object.keys(json).length !== 0) {
	    showStatus(json);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeout(monitorStatus, STATUS_INTERVAL);
}


function showStatus(json) {
    let connectiondiv = document.querySelector('#connection');
    let state = json.wpa_state;
    let status = '• • •';
    if (state) {
	if (state === 'COMPLETED') {
	    status = 'connected to <i>' + (json.ssid || 'unknown') + '</i>';
	} else {
	    console.log('state =', state);
	}
    }
    //connectiondiv.innerHTML = json.ssid + ` &nbsp; <button onclick="fetch(new Request('/disconnect',{method:'POST'}))">&#x274c/button>`;
    connectiondiv.innerHTML = status;
    //let statusdiv = document.querySelector('#statusdiv');
    //statusdiv.innerHTML = JSON.stringify(json);
}


async function monitorScan() {
    try {
        let response = await fetch(scan_request);
        let json = await response.json();
	if (json && !json.retry && Object.keys(json).length !== 0) {
	    showScan(json);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeout(monitorScan, SCAN_INTERVAL);
}


function showScan(json) {
    let networks_ul = document.querySelector('#networks');
    let html = '';
    let seen = [];
    try {
	for (let n=0; n<json.length; n++) {
	    let network = json[n];
	    let ssid = network.ssid;
	    if (!ssid || ssid.includes('\x00') || ssid.includes('\\x00')) {
		continue;
	    }
	    if (ssid.startsWith('s02-') || ssid.startsWith('JiboStation')) {
		continue;
	    }
	    if (seen.includes(ssid)) {
		continue;
	    }
	    seen.push(ssid);
	    html += '<li onclick="window.client.click_network(event)">' + ssid + '</li>\n';
	}
    } catch(err) {
	console.error(err);
    }
    networks_ul.innerHTML = html;
    let scandiv = document.querySelector('#scandiv');
    scandiv.innerHTML = JSON.stringify(json);
}


async function monitorSignal() {
    try {
        let response = await fetch(signal_request);
        let json = await response.json();
	if (json && !json.retry && Object.keys(json).length !== 0) {
	    showSignal(json);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeout(monitorSignal, SIGNAL_INTERVAL);
}


function showSignal(json) {
    //let signaldiv = document.querySelector('#signaldiv');
    //signaldiv.innerHTML = JSON.stringify(json);
}


async function init() {
    //document.body.classList.add('horizontal-mode');
    
    let form = document.getElementById('connect');
    form.addEventListener('submit', connect);

    monitorStatus();
    monitorScan();
    //monitorSignal();
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


function toggle_password_visibility(event) {
    let password = document.getElementById('password');
    let toggle = document.getElementById('visibility');
    if (password.type !== 'password') {
	password.type = 'password';
	visibility.innerHTML = '😆';
    } else {
	password.type = 'text';
	visibility.innerHTML = '👁️';
    }	
    event.preventDefault();  // keep from stealing keyboard focus
}


function click_network(event) {
    let network_li = event.target;
    let ssid = network_li.innerHTML;
    let ssid_input = document.getElementById('ssid');
    ssid_input.value = ssid;
}

window.client.init = init;
window.client.connect = connect;
window.client.toggle_password_visibility = toggle_password_visibility;
window.client.click_network = click_network;

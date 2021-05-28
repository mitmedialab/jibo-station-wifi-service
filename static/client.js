'use strict';

window.client = window.client || {};

const status_request = new Request('/status');
const scan_request = new Request('/scan');
const signal_request = new Request('/signal');


const STATUS_INTERVAL = 1 * 1000;  // 1 second
const SCAN_INTERVAL = 5 * 1000;  // 5 seconds
const SIGNAL_INTERVAL = 1 * 1000;  // 1 second

let current_rssid;


// setTimeout but then wait for the first full frame after that
// (so we can check isVisible without triggering any reflows)
function setTimeoutAnimationFrame(callback, interval) {
    setTimeout(() => window.requestAnimationFrame(callback), interval);
}


async function monitorStatus() {
    try {
        let response = await fetch(status_request);
        let data = await response.json();
	if (data && !data.retry && Object.keys(data).length !== 0) {
	    showStatus(data);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeoutAnimationFrame(monitorStatus, STATUS_INTERVAL);
}


function showStatus(status) {
    let connectiondiv = document.querySelector('#connection');
    let state = status.wpa_state;
    let html = '• • •<br>&nbsp;';
    console.log(status);
    if (state) {
	let ssid = status.ssid.replace(/\n$/, '');  // remove newline at end of string
	if (state === 'COMPLETED') {
	    html = '<div style="position:relative" data-ssid="' + (ssid || '') + '"><font color="gray">connected to </font>' + (ssid || 'unknown') + '&nbsp;&nbsp;';
	    if (current_rssid) {
		html += '<span style="position:absolute;color:#AAAAAA">' + current_rssid + '</span>';
	    }
	    html += '</div>';
	} else {
	    console.log('state =', state);
	}
	if (status.ip_address) {
	    html += '<br><span style="position:absolute;color:#4F4F4F">' + status.ip_address + '</span>';
	} else {
	    html += '<br>&nbsp;';
	}
    }
    //connectiondiv.innerHTML = status.ssid + ` &nbsp; <button onclick="fetch(new Request('/disconnect',{method:'POST'}))">&#x274c/button>`;
    connectiondiv.innerHTML = html;
}


async function monitorScan() {
    try {
        let response = await fetch(scan_request);
        let json = await response.json();
	console.log(json);
	if (json && !json.retry && Object.keys(json).length !== 0) {
	    showScan(json);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeoutAnimationFrame(monitorScan, SCAN_INTERVAL);
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
	    html += '<li onclick="window.client.click_network(event)">'
		+ '<div style="position:relative">'
		+ '<div style="position:absolute;color:#AAAAAA;left:-38px">' + network.signal + '</div>'
		+ '<div style="position:absolute;color:#AAAAAA;left:-62px;font-size:14px;opacity:0.6">' + (network.security ? '🔒' : '') + '</div>'
		+ '<span class="clickssid">' + ssid + '</span></li>\n';  // FIXME unsafe!
	    current_rssid = network.signal;
	}
    } catch(err) {
	console.error(err);
    }
    networks_ul.innerHTML = html;
    //let scandiv = document.querySelector('#scandiv');
    //scandiv.innerHTML = JSON.stringify(json);
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
    setTimeoutAnimationFrame(monitorSignal, SIGNAL_INTERVAL);
}


function showSignal(json) {
    //let signaldiv = document.querySelector('#signaldiv');
    //signaldiv.innerHTML = JSON.stringify(json);
}


async function init() {
    if ('serviceWorker' in navigator) {
	console.log('CLIENT: service worker registration in progress.');
	navigator.serviceWorker.register('/service-worker.js').then(function() {
	    console.log('CLIENT: service worker registration complete.');
	}, function() {
	    console.log('CLIENT: service worker registration failure.');
	});
    } else {
	console.log('CLIENT: service worker is not supported.');
    }

    let wifi_form = document.getElementById('connect_wifi_form');
    wifi_form.addEventListener('submit', connect_wifi);

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


async function connect_wifi(event) {
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
    let network_li = event.target.parentElement;  // FIXME breaks if there's any li element padding, or li children go deeper than one level
    let clickssid = network_li.querySelector('.clickssid');
    let ssid_input = document.getElementById('ssid');
    ssid_input.value = clickssid.textContent;
}

window.client.init = init;
window.client.connect_wifi = connect_wifi;
window.client.toggle_password_visibility = toggle_password_visibility;
window.client.click_network = click_network;

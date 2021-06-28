'use strict';

window.client = window.client || {};

const status_request = new Request('/status');
const scan_request = new Request('/scan');
const signal_request = new Request('/signal');


const STATUS_INTERVAL = 1 * 1000;  // 1 second
const SCAN_INTERVAL = 5 * 1000;  // 5 seconds
const SIGNAL_INTERVAL = 1 * 1000;  // 1 second

let current_ssid;
let current_rssi;
let connection_error;
let connection_timeout;


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

let last_status;
function showStatus(status) {
    let connectiondiv = document.querySelector('#connection');
    let state = status.wpa_state;
    let wifi_connected = (state === 'COMPLETED');
    last_status = status;

    console.log('wifi_connected', wifi_connected);

    if (wifi_connected && document.body.classList.contains('connecting')) {
	document.body.classList.remove('connecting');
	let ssid_input = document.querySelector('#ssid');
	let password_input = document.querySelector('#password');
	ssid_input.value = '';
	password_input.value = '';
	connection_error = undefined;
    }

    if (wifi_connected) {
	if (!(document.body.classList.contains('wifi-connected'))) {
	    document.body.classList.add('wifi-connected');
	    document.body.classList.add('checking');

	    if (connection_timeout) {
		clearTimeout(connection_timeout);
	    }
	    connection_timeout = setTimeout( () => {
		connection_timeout = undefined;
		document.body.classList.remove('checking');
		if (wifi_connected && !(document.body.classList.contains('server-connected'))) {
		    document.body.classList.add('contactus');
		    document.body.classList.add('contactus2');
		} else {
		    document.body.classList.remove('contactus');
		    document.body.classList.remove('contactus2');
		    connect_attempts = 0;
		}
	    }, 15 * 1000);
	}
    } else {
	document.body.classList.remove('wifi-connected');
	document.body.classList.remove('contactus');
	document.body.classList.remove('checking');
    }

    document.body.classList.remove('jibo-connected');
    document.body.classList.remove('jibo-not-connected');
    if ('jibo_connected' in status && status.jibo_connected !== undefined) {
	if (status.jibo_connected) {
	    document.body.classList.add('jibo-connected');
	} else {
	    document.body.classList.add('jibo-not-connected');
	}
    }

    document.body.classList.remove('internet-connected');
    document.body.classList.remove('internet-not-connected');
    if ('internet_connected' in status && status.internet_connected !== undefined) {
	if (status.internet_connected) {
	    document.body.classList.add('internet-connected');
	} else {
	    document.body.classList.add('internet-not-connected');
	}
    }

    document.body.classList.remove('server-connected');
    document.body.classList.remove('server-not-connected');
    if ('server_connected' in status && status.server_connected !== undefined) {
	if (status.server_connected) {
	    document.body.classList.add('server-connected');
	} else {
	    document.body.classList.add('server-not-connected');
	}
    }

    let html;
    if (connection_error) {
	html = '<font color="red">' + connection_error + '</font>';  // FIXME not html safe if ssid name is in connection_error
    } else {
	html = '<font color="lightgray">Station needs to be connected to WiFi</font>';
    }
    console.log(status);
    current_ssid = undefined;
    if (state) {
	let ssid = status.ssid && status.ssid.replace(/\n$/, '');  // remove newline at end of string
	if (wifi_connected) {
	    connection_error = undefined;
	    html = '<div style="position:relative" data-ssid="' + (ssid || '') + '"><font color="gray">connected to </font>' + (ssid || 'unknown') + '&nbsp;&nbsp;';
	    current_ssid = ssid;
	    if (current_rssi) {
		html += '<span style="position:absolute">' + rssiToBars(current_rssi, true) + '</span>';
	    }
	    html += '</div>';
	} else {
	    console.log('state =', state);
	}
    }
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
    current_rssi = undefined;
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
		+ '<div style="position:absolute;color:#AAAAAA;top:1px;left:-34px">' + rssiToBars(network.signal) + '</div>'
		+ '<div style="position:absolute;color:#AAAAAA;left:-62px;font-size:14px;opacity:0.6">' + (network.security ? '🔒' : '') + '</div>'
		+ '<span class="clickssid">' + ssid + '</span></li>\n';  // FIXME unsafe!
	    if (ssid === current_ssid) {
		current_rssi = network.signal;
	    }
	}
    } catch(err) {
	console.error(err);
    }
    networks_ul.innerHTML = html;
    ssid_changed();
    //let scandiv = document.querySelector('#scandiv');
    //scandiv.innerHTML = JSON.stringify(json);
}


function rssiToBars(rssi, bigger) {
    let quanta = 0;
    if (rssi > -40) {
	quanta = 3;
    } else if (rssi > -65) {
	quanta = 2;
    } else if (rssi > -80) {
	quanta = 1;
    }
    let classes = `bars-${quanta}`;
    if (bigger) {
	classes += ' bars-bigger';
    }
    return `<div class="${classes}" style="display:inline-block"></div>`;
}


async function monitorSignal() {
    try {
        let response = await fetch(signal_request);
        let data = await response.json();
	if (data && !data.retry && Object.keys(data).length !== 0) {
	    showSignal(data);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeoutAnimationFrame(monitorSignal, SIGNAL_INTERVAL);
}


function showSignal(data) {
    console.log('signal', data);
    //let signaldiv = document.querySelector('#signaldiv');
    //signaldiv.innerHTML = JSON.stringify(data);
}


function toggle_body_class(classname) {
    if (document.body.classList.contains(classname)) {
	document.body.classList.remove(classname);
    } else {
	document.body.classList.add(classname);
    }
}


function reset_scroll(selector) {
    let section = document.querySelector(selector);
    if (section) {
	//section.scrollTop = 0;
	section.scrollIntoView();
	//section.focus();
    }
}


let connect_attempts = 0;
async function connect_wifi(event) {
    console.log(event);
    console.log(event.target);
    event.preventDefault();

    let formdata = new FormData(event.target);
    let ssid = formdata.get('ssid');
    let password = formdata.get('password');
    let feedbackdiv = document.querySelector('#feedback');

    document.body.classList.add('connecting');
    connect_attempts++;
    if (connect_attempts > 2) {
	document.body.classList.add('contactus2');
    }

    try {
	reset_scroll('#wifi_section');

	console.log(formdata);
	console.log(formdata.get('ssid'));
	console.log(formdata.get('password'));

	feedback.textContent = "Connecting to " + ssid + "...";
	connection_error = undefined;

	let trim_space = document.querySelector('#trim_spaces');
	if (!trim_space || trim_space.checked) {
	    console.log('trimming spaces');
	    ssid = ssid.trim();
	    password = password.trim();
	}

	//await fetch(new Request('/connect',{method:'POST',body:formdata}))

	let data = {
	    ssid,
	    password,
	};

	await fetch('/connect', {
	    method: 'POST',
	    body: JSON.stringify(data),
	    headers: {
		'Content-Type': 'application/json'
	    }
	});
    } catch(err) {
	console.error('error during connect', err);
    }
    connection_timeout = setTimeout( () => {
	connection_timeout = undefined;
	if (document.body.classList.contains('connecting')) {
	    connection_error = `Could not connect to ${ssid} password might be incorrect`;
	    document.body.classList.remove('connecting');
	}
    }, 10 * 1000);
}


function cancel_connecting() {
    if (connection_timeout) {
	clearTimeout(connection_timeout);
	connection_timeout = undefined;
	document.body.classList.remove('connecting');
    }
}


async function disconnect_wifi() {
    document.body.classList.add('disconnecting');
    document.body.classList.remove('contactus');
    try {
	reset_scroll('#wifi_section');
	let request = new Request('/disconnect',{ method:'POST' });
	fetch(request);
	reset_scroll('#wifi_section');
    } catch(err) {
	console.error('error during disconnect', err);
    }
    setTimeout( () => {
	document.body.classList.remove('disconnecting');
    }, 5 * 1000);
}


function toggle_password_visibility(event) {
    let password = document.querySelector('#password');
    let toggle = document.querySelector('#visibility');
    if (password.type !== 'password') {
	password.type = 'password';
	visibility.innerHTML = '😆';
    } else {
	password.type = 'text';
	visibility.innerHTML = '👁️';
    }	
    event.preventDefault();  // keep from stealing keyboard focus
}


function ssid_changed(event) {
    console.log('ssid changed');
    let ssid_input = document.querySelector('#ssid');
    let trim_space = document.querySelector('#trim_spaces');
    let ssid_value = ssid_input.value;
    if (!trim_space || trim_space.checked) {
	ssid_value = ssid_value.trim();
    }
    let li_entries = document.querySelectorAll('li');
    for (let li_entry of li_entries) {
	let clickssid = li_entry.querySelector('.clickssid');
	if (!clickssid) {
	    continue;
	}
	if (clickssid.textContent === ssid_value) {
	    console.log('matched!');
	    li_entry.classList.add('matched');
	} else {
	    li_entry.classList.remove('matched');
	}
    }
}


function password_focused(event) {
    let connect_button = document.querySelector('#connect');
    connect_button.scrollIntoView(false);
}


function click_network(event) {
    let network_li = event.target.parentElement;  // FIXME breaks if there's any li element padding, or li children go deeper than one level
    let clickssid = network_li.querySelector('.clickssid');
    let ssid_input = document.querySelector('#ssid');
    let password_input = document.querySelector('#password');
    ssid_input.value = clickssid.textContent;
    ssid_changed();
    password.value = '';
    password_input.focus();
}


function show_nomatch_panel() {
    document.body.classList.add('shownomatchpanel');
}


function show_info_panel() {
    document.body.classList.add('showinfopanel');
    let local_ip_address = document.querySelector('#local_ip_address');
    if (last_status && last_status.ip_address) {
	local_ip_address.textContent = last_status.ip_address;
    } else {
	local_ip_address.textContent = '➖';
    }
    let rover_ip_address = document.querySelector('#rover_ip_address');
    if (last_status && last_status.rover_ip_address) {
	rover_ip_address.textContent = last_status.rover_ip_address;
    } else {
	rover_ip_address.textContent = '➖';
    }
}


function dismiss_all_panels() {
    document.body.classList.remove('showinfopanel');
    document.body.classList.remove('shownomatchpanel');
}


async function init() {
    //if ('serviceWorker' in navigator) {
    //	console.log('CLIENT: service worker registration in progress.');
    //	navigator.serviceWorker.register('/service-worker.js').then(function() {
    //	    console.log('CLIENT: service worker registration complete.');
    //	}, function() {
    //	    console.log('CLIENT: service worker registration failure.');
    //	});
    //} else {
    //	console.log('CLIENT: service worker is not supported.');
    //}

    //reset_scroll('#wifi_section');
    reset_scroll('#sectionholder');

    let wifi_form = document.querySelector('#connect_wifi_form');
    wifi_form.addEventListener('submit', connect_wifi);

    let ssid_input = document.querySelector('#ssid');
    let password_input = document.querySelector('#password');
    ssid_input.addEventListener('input', ssid_changed);
    password_input.addEventListener('focus', password_focused);

    let clickinfo = document.querySelector('#clickinfo');
    clickinfo.addEventListener('click', show_info_panel);
    let dismiss_buttons = document.querySelectorAll('#dismiss');
    for (let dismiss_button of dismiss_buttons) {
	dismiss_button.addEventListener('click', dismiss_all_panels);
    }

    monitorStatus();
    monitorScan();
    //monitorSignal();
}


window.client.init = init;
window.client.cancel_connecting = cancel_connecting;
window.client.disconnect_wifi = disconnect_wifi;
window.client.click_network = click_network;
window.client.toggle_password_visibility = toggle_password_visibility;

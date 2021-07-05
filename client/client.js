'use strict';

window.client = window.client || {};

const MobileDetect = require('mobile-detect');

const status_request = new Request('/status');
const status_request_first = new Request('/status?first=true');
const scan_request = new Request('/scan');
//const signal_request = new Request('/signal');


const PING_INTERVAL = 1 * 1000;  // 1 second
const STATUS_INTERVAL = 2 * 1000;  // 2 seconds
const SCAN_INTERVAL = 5 * 1000;  // 5 seconds
//const SIGNAL_INTERVAL = 1 * 1000;  // 1 second

let current_ssid;
let current_rssi;
let connection_error;
let connection_timeout;


// setTimeout but then wait for the first full frame after that
// (so we can check isVisible without triggering any reflows)
function setTimeoutAnimationFrame(callback, interval) {
    setTimeout(() => window.requestAnimationFrame(callback), interval);
}


async function monitorServer() {
    try {
        let response = await fetch('/ping');
	document.body.classList.remove('noserver');
    } catch(err) {
        console.error(err);
	document.body.classList.add('noserver');
    }
    setTimeoutAnimationFrame(monitorServer, PING_INTERVAL);
}


async function monitorStatus() {
    try {
        let response = await fetch(first ? status_request_first : status_request);
	first = false;
        let data = await response.json();
	if (data && !data.retry && Object.keys(data).length !== 0) {
	    showStatus(data);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeoutAnimationFrame(monitorStatus, STATUS_INTERVAL);
}


let first = true;
let last_status;  // for the popup info panel
function showStatus(status) {
    let state = status.wpa_state;
    let wifi_connected = (state === 'COMPLETED');
    let wifi_ssid;
    if (state && status.ssid) {
	wifi_ssid = status.ssid;
	wifi_ssid = wifi_ssid.replace(/\n$/, '');  // remove newline at end of string
    }
    if (wifi_connected) {
	connection_error = false;
    }
    
    last_status = status;  // for the popup info panel

    console.log('wifi_ssid', wifi_ssid, 'wifi_connected', wifi_connected);

    if (wifi_connected && document.body.classList.contains('connecting')) {
	document.body.classList.remove('connecting');
	document.body.classList.add('checking');
	// let ssid_input = document.querySelector('#ssid');
	// let password_input = document.querySelector('#password');
	// ssid_input.value = '';
	// password_input.value = '';
    }

    if (wifi_connected) {
	if (!(document.body.classList.contains('wifi-connected')) && !(document.body.classList.contains('disconnecting'))) {
	    document.body.classList.add('wifi-connected');
	    //document.body.classList.add('checking');

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
	    }, 25 * 1000);
	}
    } else {
	document.body.classList.remove('wifi-connected');
	document.body.classList.remove('contactus');
	document.body.classList.remove('checking');
	first = true;
    }

    document.body.classList.remove('jibo-connected');
    document.body.classList.remove('jibo-not-connected');
    if (('jibo_connected' in status) && status.jibo_connected !== undefined) {
	if (status.jibo_connected) {
	    document.body.classList.add('jibo-connected');
	} else {
	    document.body.classList.remove('checking');
	    document.body.classList.add('contactus');
	    document.body.classList.add('jibo-not-connected');
	}
    }

    document.body.classList.remove('internet-connected');
    document.body.classList.remove('internet-not-connected');
    console.log(status.internet_connected);
    if (('internet_connected' in status) && status.internet_connected !== undefined) {
	if (status.internet_connected) {
	    document.body.classList.add('internet-connected');
	} else {
	    document.body.classList.remove('checking');
	    document.body.classList.add('contactus');
	    document.body.classList.add('internet-not-connected');
	}
    }

    document.body.classList.remove('server-connected');
    document.body.classList.remove('server-not-connected');
    if (('server_connected' in status) && status.server_connected !== undefined) {
	document.body.classList.remove('checking');
	if (status.server_connected) {
	    document.body.classList.add('server-connected');
	    document.body.classList.remove('contactus');
	    document.body.classList.remove('contactus2');
	} else {
	    document.body.classList.add('server-not-connected');
	}
    }

    showConnection(wifi_ssid || current_ssid, wifi_connected, connection_error);
}


function showConnection(wifi_ssid, wifi_connected, wifi_error) {
    let connectiondiv = document.querySelector('#connection');
    let template = document.querySelector('#wifi_connection_none');
    let div = template.content.firstElementChild.cloneNode(true);
    let connecting = document.body.classList.contains('connecting');
    let disconnecting = document.body.classList.contains('disconnecting');
    if (connecting || disconnecting) {
	template = document.querySelector('#wifi_connection_blank');
	div = template.content.firstElementChild.cloneNode(true);
    } else if (wifi_connected) {
	current_ssid = wifi_ssid;
	template = document.querySelector('#wifi_connection_good');
	div = template.content.firstElementChild.cloneNode(true);
	console.log(wifi_ssid, div, div.querySelector('#wifi_ssid'));
	if (wifi_ssid)    div.querySelector('#wifi_ssid').textContent = wifi_ssid;
	if (current_rssi) div.querySelector('#wifi_bars').classList.add('bars-'+ rssiToBars(current_rssi, true), 'bars-bigger');
    } else if (wifi_error) {
	template = document.querySelector('#wifi_connection_error');
	div = template.content.firstElementChild.cloneNode(true);
	if (wifi_ssid) div.querySelector('#wifi_ssid').textContent = wifi_ssid;
	div.querySelector('#line2').textContent = wifi_error;
    }
    connectiondiv.replaceChildren(div);
}


function loadContactMessages(project) {
    let wellness = false;
    if (project === 'wellness') {
	wellness = true;
    }
    
    let contactusdiv = document.querySelector('#contactus');
    let contactus2div = document.querySelector('#contactus2');
    let contactus0div = document.querySelector('#contactus0');
    let template;
    let template2;
    if (wellness) {
	template = document.querySelector('#contactus_wellness');
	template2 = document.querySelector('#contactus2_wellness');
    } else {
	template = document.querySelector('#contactus_generic');
	template2 = document.querySelector('#contactus2_generic');
    }
    let center = template.content.firstElementChild.cloneNode(true);
    let center2 = template2.content.firstElementChild.cloneNode(true);
    let center0 = template.content.firstElementChild.cloneNode(true);
    contactusdiv.replaceChildren(center);
    contactus2div.replaceChildren(center2);
    contactus0div.replaceChildren(center0);
}


async function monitorScan() {
    try {
        let response = await fetch(scan_request);
        let data = await response.json();
	//console.log(data);
	if (data && !data.retry && Object.keys(data).length !== 0) {
	    showScan(data);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeoutAnimationFrame(monitorScan, SCAN_INTERVAL);
}


function showScan(data) {
    let network_list = document.querySelector('#network_list');
    let template = document.querySelector('#network_list_entry');
    let seen = [];
    let entries = document.createDocumentFragment();
    current_rssi = undefined;
    try {
	for (let n=0; n<data.length; n++) {
	    let network = data[n];
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

	    let li = template.content.firstElementChild.cloneNode(true);
	    let open = (!network.security) || network.security === "open";
	    li.querySelector('#wifi_security').textContent = (open ? '' : '🔒' );
	    li.querySelector('#wifi_bars').classList.add('bars-'+rssiToBars(network.signal));
	    li.querySelector('#wifi_ssid').textContent = ssid;
	    li.addEventListener('click', click_network);

	    entries.appendChild(li);

	    if (ssid === current_ssid) {
		current_rssi = network.signal;
	    }
	}
    } catch(err) {
	console.error(err);
    }
    network_list.replaceChildren(entries);
    ssid_changed();
}


function rssiToBars(rssi) {
    let quanta = 0;
    if (rssi > -40) {
	quanta = 3;
    } else if (rssi > -65) {
	quanta = 2;
    } else if (rssi > -80) {
	quanta = 1;
    }
    return quanta;
}


// async function monitorSignal() {
//     try {
//         let response = await fetch(signal_request);
//         let data = await response.json();
// 	if (data && !data.retry && Object.keys(data).length !== 0) {
// 	    showSignal(data);
// 	}
//     } catch(err) {
//         console.error(err);
//     }
//     setTimeoutAnimationFrame(monitorSignal, SIGNAL_INTERVAL);
// }


// function showSignal(data) {
//     console.log('signal', data);
// }


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
    showConnection();
    connect_attempts++;
    if (connect_attempts > 1) {
	document.body.classList.add('contactus2');
    }

    try {
	//reset_scroll('#wifi_section');

	console.log(formdata);
	console.log(formdata.get('ssid'));
	console.log(formdata.get('password'));

	let trim_space = document.querySelector('#trim_spaces');
	if (!trim_space || trim_space.checked) {
	    console.log('trimming spaces');
	    ssid = ssid.trim();
	    password = password.trim();
	}

	feedback.textContent = "Connecting to " + ssid + "...";
	connection_error = false;

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
	    document.body.classList.remove('connecting');
	    let matched = ssid_changed();
	    if (matched) {
		connection_error = 'Password might be incorrect';
	    } else {
		connection_error = 'Network name or password might be incorrect';
	    }
	    showConnection(ssid, false, connection_error);
	    current_ssid = ssid;
	}
    }, 15 * 1000);
}


function cancel_connecting() {
    if (connection_timeout) {
	clearTimeout(connection_timeout);
	connection_timeout = undefined;
	document.body.classList.remove('connecting');
    }
    disconnect_wifi();
}


async function disconnect_wifi() {
    document.body.classList.add('disconnecting');
    document.body.classList.remove('wifi-connected');
    document.body.classList.remove('connecting');
    document.body.classList.remove('contactus');
    showConnection();
    try {
	//reset_scroll('#wifi_section');
	let request = new Request('/disconnect',{ method:'POST' });
	fetch(request);
	//reset_scroll('#wifi_section');
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
	visibility.textContent = '😆';
    } else {
	password.type = 'text';
	visibility.textContent = '👁️';
    }	
    event.preventDefault();  // keep from stealing keyboard focus
}


function ssid_changed() {
    console.log('ssid changed');
    let ssid_input = document.querySelector('#ssid');
    let trim_space = document.querySelector('#trim_spaces');
    let ssid_value = ssid_input.value;
    if (!trim_space || trim_space.checked) {
	ssid_value = ssid_value.trim();
    }
    let li_entries = document.querySelectorAll('li');
    let matched = false;
    for (let li_entry of li_entries) {
	let wifi_ssid = li_entry.querySelector('#wifi_ssid');
	if (!wifi_ssid) {
	    continue;
	}
	if (wifi_ssid.textContent === ssid_value) {
	    console.log('matched!');
	    li_entry.classList.add('matched');
	    matched = true;
	} else {
	    li_entry.classList.remove('matched');
	}
    }
    return matched;
}


function password_focused(event) {
    let connect_wifi_form = document.querySelector('#connect_wifi_form');
    //connect_wifi_form.scrollIntoView(false);
    //setTimeout( () => { connect_wifi_form.scrollIntoView(false); }, 500);
}


function click_network(event) {
    console.log(event.target);
    let wifi_ssid = event.target.querySelector('#wifi_ssid');
    let ssid_input = document.querySelector('#ssid');
    let password_input = document.querySelector('#password');
    ssid_input.value = wifi_ssid.textContent;
    ssid_changed();
    password.value = '';
    password_input.focus();
}


function show_nomatch_panel() {
    document.body.classList.add('shownomatchpanel');
}


function show_info_panel() {
    document.body.classList.add('showinfopanel');
    let local_hostname = document.querySelector('#local_hostname');
    if (last_status && last_status.hostname) {
	local_hostname.textContent = last_status.hostname;
    } else {
	local_hostname.textContent = '➖';
    }
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
    document.body.classList.remove('showdonepanel');
    ssid_changed();
}


let hashParams = {};
function parseHash() {
    let hash = window.location.hash.substr(1);
    hashParams = hash.split('&').reduce(function (result, item) {
	let parts = item.split('=');
	if (typeof parts[1] === 'undefined') {
	    parts[1] = true;
	}
	result[parts[0]] = parts[1];
	return result;
    }, {});
}


function finished() {
    try {
	window.close();  // actually works on some tables when web page is launched from an icon on the home page
    } catch(err) {
	console.log('error from window.close()', err);
    }
    console.log('finished?');
    document.body.classList.add('showdonepanel');
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
    //reset_scroll('#sectionholder');

    let md = new MobileDetect(window.navigator.userAgent);
    console.log('md', md);
    //window.md = md;
    let debugstr = JSON.stringify(md);
    for (let f of ['mobile', 'phone', 'tablet', 'userAgent', 'os']) {
	let v = '';
	try {
	    v = JSON.stringify(md[f]());
	} catch {
	    console.error('error stringifying or calling md.' + f);
	}
	console.log(f, v);
	debugstr += `\n${f}:${v}`;
    }
    debugstr += `\n${md.version('Android')}`;
    debugstr += `\nscreen.width x height: ${window.screen.width} x ${window.screen.height}`;
    fetch(new Request('/debug',{method:'POST',body:debugstr}));

    parseHash();
    
    let project = 'generic';
    if (hashParams.project) {
	project = hashParams.project;
    } else {
	if (md.tablet()) {
	    if (window.screen.width === 1138 && window.screen.width === 712) {
		project = 'literacy';
	    }
	}
    }

    loadContactMessages(project);

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

    monitorServer();
    monitorStatus();
    monitorScan();
    //monitorSignal();
}


window.client.init = init;
window.client.cancel_connecting = cancel_connecting;
window.client.disconnect_wifi = disconnect_wifi;
window.client.click_network = click_network;
window.client.toggle_password_visibility = toggle_password_visibility;
window.client.finished = finished;

'use strict';

window.client = window.client || {};

const MobileDetect = require('mobile-detect');

const status_request = new Request('/status');
const scan_request = new Request('/scan');


const PING_INTERVAL = 1 * 1000;  // 1 second
const PING_TIMEOUT = 5 * 1000;  // 5 seconds
const STATUS_INTERVAL = 2 * 1000;  // 2 seconds
const SCAN_INTERVAL = 10 * 1000;  // 10 seconds
// how long to wait before deciding the wifi connection attempt failed
const CONNECTION_TIMEOUT = 20 * 1000;  // 20 seconds
// how long to wait for all the status checks to pass
const CONTACTUS_TIMEOUT = 25 * 1000;  // 25 seconds
const DISCONNECTING_PANEL_TIMEOUT = 5 * 1000;  // 5 seconds

let hashParams = {};
let current_ssid;
let current_rssi;
let connection_error_message;
let connection_timeout;
let attempt_browser_close;
let status_phase;
let status_cycles;
let status_errors;


// setTimeout but then wait for the first full frame after that
// (so we can check isVisible without triggering any reflows)
function setTimeoutAnimationFrame(callback, interval) {
    setTimeout(() => window.requestAnimationFrame(callback), interval);
}


async function monitorServerLoop() {
    let timeout;
    //console.log('ping start');
    //console.time('ping');
    try {
	timeout = setTimeout( () => {
	    timeout = null;
	    console.error('ping timed out');
	    //console.time('ping');
	    document.body.classList.add('noserver');
	    document.body.classList.remove('rebooting');
	}, PING_TIMEOUT);
	//console.log('ping fetch');
	//console.timeLog('ping');
        let response = await fetch('/ping');
	//console.log('ping fetch done');
	//console.timeLog('ping');
	document.body.classList.remove('noserver');
    } catch(err) {
	console.log('ping error');
	if (timeout) {
	    //console.timeLog('ping');
	}
        console.error(err);
	document.body.classList.add('noserver');
	document.body.classList.remove('rebooting');
    }
    //console.log('ping end');
    if (timeout) {
	//console.timeEnd('ping');
	clearTimeout(timeout);
    }
    setTimeoutAnimationFrame(monitorServerLoop, PING_INTERVAL);
}


async function monitorStatusLoop() {
    try {
        let response = await fetch(status_request);
        let data = await response.json();
	if (data && !data.retry && Object.keys(data).length !== 0) {
	    document.body.classList.remove('nostatus');
	    showStatus(data);
	}
    } catch(err) {
        console.error(err);
    }
    setTimeoutAnimationFrame(monitorStatusLoop, STATUS_INTERVAL);
}


function showStatus(status) {
    let state = status.wpa_state;
    let wifi_connected = (state === 'COMPLETED');
    let wifi_ssid;
    if (state && status.ssid) {
	wifi_ssid = status.ssid.replace(/\n$/, '');  // remove newline at end of string
    }

    try {
	showConnection(wifi_ssid || current_ssid, wifi_connected);
    } catch { }

    try {
	update_info_panel(status, wifi_ssid, current_rssi);
    } catch { }

    if (wifi_connected) {
	if (!status_phase) {
	    status_phase = 2;
	    status_cycles = 0;
	}
    } else {
	if (status_phase) {
	    status_phase = 0;
	    status_cycles = 0;
	}
    }

    let last_status_phase = status_phase;
    status_cycles++;
    
    let internet_connected = status.internet_connected && status.server_connected;
    let jibo_connected = status.jibo_connected;
    let ros_connected = status.no_ros || status.ros_connected;

    switch (status_phase) {
    case 2:
	if ((internet_connected) || (status_cycles > 6)) {
	    status_phase++;
	}
	break;
	
    case 3:
	if (jibo_connected || status_cycles > 1) {
	    status_phase++;
	}
	break;

    case 4:
	if (status.ros_connected || status_cycles > 1) {
	    status_phase++;
	}
	break;
    }

    if (status_phase !== last_status_phase) {
	status_cycles = 0;
    }	

    showStatusBoard(status, status_phase, wifi_connected, internet_connected, jibo_connected, ros_connected);
}


async function showStatusBoard(status, status_phase, wifi_connected, internet_connected, jibo_connected, ros_connected) {

    document.body.classList.remove('internet-connected');
    document.body.classList.remove('internet-not-connected');
    document.body.classList.remove('jibo-connected');
    document.body.classList.remove('jibo-not-connected');
    document.body.classList.remove('systems-connected');
    document.body.classList.remove('systems-not-connected');

    if (jibo_connected || !wifi_connected) {
	document.body.classList.remove('turnjiboonpanel');
	document.body.classList.remove('jiboproblem');
    }

    if (ros_connected || !jibo_connected || !wifi_connected) {
	document.body.classList.remove('restartstationpanel');
	document.body.classList.remove('rosproblem');
    }

    if (wifi_connected) {
	document.body.classList.remove('connecting');

	if (!(document.body.classList.contains('disconnecting'))) {
	    document.body.classList.add('wifi-connected');
	}

	if (status_phase < 5) {
	    document.body.classList.add('checking');
	    document.body.classList.remove('contactus');
	    document.body.classList.remove('contactus2');
	} else {
	    document.body.classList.remove('checking');
	}

	if (status_phase > 2) {
	    if (internet_connected) {
		document.body.classList.add('internet-connected');
	    } else {
		document.body.classList.add('internet-not-connected');
	    }
	}

	if (status_phase > 3) {
	    if (jibo_connected) {
		document.body.classList.add('jibo-connected');
	    } else {
		document.body.classList.add('jibo-not-connected');
	    }

	    if (!jibo_connected && internet_connected) {
		if (!document.body.classList.contains('jiboproblem')) {
		    if (!expert_mode()) {
			document.body.classList.add('turnjiboonpanel');
		    }
		    document.body.classList.add('jiboproblem');
		}
	    }
	}

	if (status_phase > 4) {
	    let all_systems_go = internet_connected && jibo_connected && ros_connected;
	    if (all_systems_go) {
		connect_attempts = 0;
		document.body.classList.add('systems-connected');
		document.body.classList.remove('contactus');
		document.body.classList.remove('contactus2');
		document.body.classList.remove('jiboproblem');
		document.body.classList.remove('rosproblem');
	    } else {
		document.body.classList.add('systems-not-connected');
		document.body.classList.add('contactus');
		document.body.classList.add('contactus2');

		if (!ros_connected && jibo_connected && internet_connected) {
		    if (!document.body.classList.contains('rosproblem')) {
			if (!expert_mode()) {
			    document.body.classList.add('restartstationpanel');
			}
			document.body.classList.add('rosproblem');
		    }
		}
	    }
	}
    }
}


function popup_problem_panel() {
    if (document.body.classList.contains('jiboproblem')) {
	document.body.classList.add('turnjiboonpanel');
    } else if (document.body.classList.contains('rosproblem')) {
	document.body.classList.add('restartstationpanel');
    } else {
    }
}


function showConnection(wifi_ssid, wifi_connected) {
    let connectiondiv = document.querySelector('#connection');
    let template = document.querySelector('#wifi_connection_none');
    let div = template.content.firstElementChild.cloneNode(true);
    let connecting = document.body.classList.contains('connecting');
    let disconnecting = document.body.classList.contains('disconnecting');
    if (connecting || disconnecting) {
	template = document.querySelector('#wifi_connection_blank');
	div = template.content.firstElementChild.cloneNode(true);
    } else if (wifi_connected) {
	connection_error_message = false;
	current_ssid = wifi_ssid;
	template = document.querySelector('#wifi_connection_good');
	div = template.content.firstElementChild.cloneNode(true);
	if (wifi_ssid)    div.querySelector('#wifi_ssid').textContent = wifi_ssid;
	if (current_rssi) div.querySelector('#wifi_bars').classList.add('bars-'+ rssiToBars(current_rssi, true), 'bars-bigger');
    } else if (connection_error_message) {
	template = document.querySelector('#wifi_connection_error');
	div = template.content.firstElementChild.cloneNode(true);
	if (wifi_ssid) div.querySelector('#wifi_ssid').textContent = wifi_ssid;
	div.querySelector('#line2').textContent = connection_error_message;
    }
    replaceChildren(connectiondiv, div);
}


function loadContactMessages(project) {
    return;
    let wellness = false;
    if (project === 'wellness') {
	wellness = true;
    }
    console.log('wellness', wellness);
    
    let contactusdiv = document.querySelector('#contactus');
    let contactus2div = document.querySelector('#contactus2');
    let contactus0div = document.querySelector('#contactus0');

    //FIXME two more places to tweak the message (turnonjibo and restartstation panels)
    let template = document.querySelector('#contactus_generic');
    let template2 = document.querySelector('#contactus2_generic');
    let template0 = document.querySelector('#contactus0_generic');

    if (wellness) {
	//template = document.querySelector('#contactus_wellness');
	template2 = document.querySelector('#contactus2_wellness');
	template0 = document.querySelector('#contactus0_wellness');
    }
    let center = template.content.firstElementChild.cloneNode(true);
    let center2 = template2.content.firstElementChild.cloneNode(true);
    let center0 = template0.content.firstElementChild.cloneNode(true);
    replaceChildren(contactusdiv, center);
    replaceChildren(contactus2div, center2);
    replaceChildren(contactus0div, center0);
}


async function monitorScanLoop() {
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
    setTimeoutAnimationFrame(monitorScanLoop, SCAN_INTERVAL);
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
    replaceChildren(network_list, entries);
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
	let trim_space = document.querySelector('#trim_spaces');
	if (!trim_space || trim_space.checked) {
	    console.log('trimming spaces');
	    ssid = ssid.trim();
	    password = password.trim();
	}

	feedback.textContent = "Connecting to " + ssid + "...";
	connection_error_message = false;

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

	// let ssid_input = document.querySelector('#ssid');
	// let password_input = document.querySelector('#password');
	// ssid_input.value = '';
	// password_input.value = '';
    } catch(err) {
	console.error('error during connect', err);
    }
    connection_timeout = setTimeout( () => {
	connection_timeout = undefined;
	if (document.body.classList.contains('connecting')) {
	    document.body.classList.remove('connecting');
	    let matched = ssid_changed();
	    if (matched) {
		connection_error_message = 'Password might be incorrect';
	    } else {
		connection_error_message = 'Network name or password might be incorrect';
	    }
	    showConnection(ssid, false);
	    current_ssid = ssid;
	}
    }, CONNECTION_TIMEOUT);
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
    }, DISCONNECTING_PANEL_TIMEOUT);
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


function expert_mode() {
    let expert_mode = document.querySelector('#expert_mode');
    if (expert_mode && expert_mode.checked) {
	document.body.classList.add('expertmode');
	return true;
    }
    document.body.classList.remove('expertmode');
    return false;
}


function ssid_changed() {
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


function update_info_panel(last_status, wifi_ssid, wifi_rssi) {
    let local_hostname = document.querySelector('#local_hostname');
    if (last_status && last_status.hostname) {
	local_hostname.textContent = last_status.hostname;
    } else {
	local_hostname.textContent = '➖';
    }
    let local_uptime = document.querySelector('#local_uptime');
    if (last_status && last_status.uptime) {
	local_uptime.textContent = Math.floor(Number(last_status.uptime)/60) + ' mins';
    } else {
	local_uptime.textContent = '➖';
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
    let info_wifi_ssid = document.querySelector('#info_wifi_ssid');
    if (wifi_ssid) {
	info_wifi_ssid.textContent = wifi_ssid;
    } else {
	info_wifi_ssid.textContent = '➖';
    }
    let info_wifi_rssi = document.querySelector('#info_wifi_rssi');
    if (wifi_rssi) {
	info_wifi_rssi.textContent = wifi_rssi;
    } else {
	info_wifi_rssi.textContent = '➖';
    }
    let dhcp_leases = document.querySelector('#dhcp_leases');
    if (last_status && last_status.dhcp_leases) {
	let template = document.querySelector('template[name="dhcp_leases"]');
	let dhcp_leases_table = template.content.cloneNode(true);
	let entries = document.createDocumentFragment();
	try {
	    for (let lease of last_status.dhcp_leases) {
		// 1625731234 52:01:13:1f:df:8e 10.99.0.13 JiboStation24 01:52:01:13:1f:df:8e
		let [lease_time, mac_address, ip_address, dhcp_name, dunnowhatthisis] = lease;
		if (!ip_address) continue;
		let tr = template.content.querySelector('tr').cloneNode(true);
		tr.querySelector('#lease_time').textContent = lease_time;
		tr.querySelector('#mac_address').textContent = mac_address;
		tr.querySelector('#ip_address').textContent = ip_address;
		if (ip_address === last_status.jibo_ip_address) {
		    tr.classList.add('matched');
		}
		tr.querySelector('#dhcp_name').textContent = dhcp_name;
		entries.appendChild(tr);
	    }
	} catch(err) {
	    console.error(err);
	}

	let tbody = dhcp_leases_table.querySelector('tbody');
	replaceChildren(tbody, entries);
	replaceChildren(dhcp_leases, dhcp_leases_table);
    } else {
	dhcp_leases.textContent = '➖';
    }
}

function show_info_panel() {
    document.body.classList.add('showinfopanel');
}


function dismiss_all_panels() {
    document.body.classList.remove('showinfopanel');
    document.body.classList.remove('showdonepanel');
    document.body.classList.remove('turnjiboonpanel');
    document.body.classList.remove('restartstationpanel');
    ssid_changed();
}


// Element.replaceChildren() is too new to use
function replaceChildren(parent, newChildren) {
    while (parent.firstChild) {
	parent.firstChild.remove();
    }
    parent.append(newChildren);
}    


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


function reboot() {
    fetch(new Request('/reboot',{method:'POST'}));
    document.body.classList.add('rebooting');
    dismiss_all_panels();
}


function finished() {
    if (attempt_browser_close) {
	try {
	    window.close();  // actually works on some tables when web page is launched from an icon on the home page
	} catch(err) {
	    console.log('error from window.close()', err);
	}
    }
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
	    if (window.screen.width === 1280 && window.screen.height === 800) {
		project = 'wellness';
	    } else if (window.screen.width === 1138 && window.screen.height === 712) {
		project = 'literacy';
	    }
	}
	let android_version = md.version('Android');
	if (android_version) {
	    android_version = Number(android_version);
	}
	if (android_version && android_version >= 9) {
	    attempt_browser_close = true;
	    fetch(new Request('/debug',{method:'POST',body:'going to attempt browser close on done'}));
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

    monitorServerLoop();
    monitorStatusLoop();
    monitorScanLoop();
}


window.client.init = init;
window.client.cancel_connecting = cancel_connecting;
window.client.disconnect_wifi = disconnect_wifi;
window.client.click_network = click_network;
window.client.toggle_password_visibility = toggle_password_visibility;
window.client.popup_problem_panel = popup_problem_panel;
window.client.reboot = reboot;
window.client.finished = finished;

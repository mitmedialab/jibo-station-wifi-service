<script>
  import * as client from '$lib/client.js';
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    client.init();
  });
</script>


<svelte:head>
  <title>JiboStationSetup</title>
</svelte:head>

<div id="sectionholder">
  <section id="wifi_section">
    <h2 style="font-size:64px">📶
      <span style="font-size:58px">Jibo Station Setup</span>
    </h2>

    <br>
    <center>
      <div id="connection" style="font-size:22px;font-weight:700;color:white;margin-bottom:20px">
	<div>
	  <div id="line1">➖</div>
	  <div id="line2">&nbsp;</div>
	</div>
      </div>

      <template id="wifi_connection_none">
	<div>
	  <div id="line1" style="color:lightgray">Station needs to be connected to WiFi</div>
	  <div id="line2">&nbsp;</div>
	</div>
      </template>
      <template id="wifi_connection_blank">
	<div>
	  <div id="line1">&nbsp;</div>
	  <div id="line2">&nbsp;</div>
	</div>
      </template>
      <template id="wifi_connection_good">
	<div>
	  <div id="line1" style="position:relative">
	    <font color="gray">connected to </font><span id="wifi_ssid">unknown</span>
	    &nbsp;<span style="position:absolute"><div id="wifi_bars"></div></span>
	  </div>
	  <div id="line2">&nbsp;</div>
	</div>
      </template>
      <template id="wifi_connection_error">
	<div>
	  <div id="line1" style="color:red">Could not connect to <span id="wifi_ssid">unknown</span></div>
	  <div id="line2" style="color:red"></div>
	</div>
      </template>

    </center>

    <!-- <div id="notconnected" style="display:inline-grid;place-items:start"> -->
    <div id="notconnected" style="flex-wrap:wrap;justify-content:center">
      <div style="position:relative;top:-12px;flex:0 1 500px">
	<div style="text-align:left;margin-bottom:12px">
	  <font color="lightgray">Visible networks &nbsp;<font color="gray">tap to select</font></font>
	</div>
	<div>
	  <div style="width:100%;height:50vh;text-align:left;overflow-y:scroll">
	    <ul width=300 id="network_list" style="width:450px;list-style:none;font-size:20px;font-weight:900;margin-left:2px;margin-top:4px;white-space:nowrap">
	      <li><i>looking for networks...</i></li>
	    </ul>

	    <template id="network_list_entry">
	      <li class="network_list_entry" style="background-color:#2B4C56">
		<div style="position:relative;pointer-events:none">
		  <span id="wifi_security" style="position:relative;display:inline-block;top:-2px;width:18px;font-size:18px;opacity:0.6;margin:0 4px 0 8px;pointer-events:none"></span>
		  <div style="display:inline-block;position:relative;height:20px;width:24px;top:1px;pointer-events:none"><div id="wifi_bars" style="pointer-events:none"></div></div>
		  <span id="wifi_ssid" style="pointer-events:none"></span>
		</div>
	      </li>
	    </template>

	  </div>
	</div>
      </div>

      <div style="display:inline-block;width:600px;position:relative">
	<center>
	  <form width="100%" id="connect_wifi_form" enctype="multipart/form-data" method="post" style="font-size:20px;line-height:26px;padding-bottom:16px">
	    <table width="400" style="display:grid;place-items:center;background-color:#1B3C45">
	      <tr><td style="height:50px"></td></tr>
	      <tr>
		<td></td>
		<td>
		  <div style="font-size:20px;font-weight:900">
		    <label for="ssid">Network Name</label><br>
		    <input id="ssid" autocorrect="off" autocapitalize="none" type="text" name="ssid" size="18" style="font-size:24px;margin-top:5px;" required/>
		  </div>
		</td>
		<td style="width:25px"></td>
		<td rowspan="4" style="padding-top:112px">
		  <span style="display: inline-block; border-radius: 4px; background: #1f8b5f; border-bottom: 2px solid #1f8b5f;">
		    <button id="connect" class="normal">
		      Connect WiFi
		    </button>
		  </span>
		</td>
	      </tr>
	      <tr><td style="height:30px"></td></tr>
	      <tr>
		<td style="width:45px">
		  <button id="visibility" type="button" class="eyes" onclick="client.toggle_password_visibility(event)">👁️</button>
		</td>
		<td style="font-size:20px;font-weight:900">
		  <div style="font-size:20px;font-weight:900">
		    <label for="password">WiFi Password<div style="color:gray;font-size:11px;margin-top:-8px;margin-left:2px"><i>leave blank if no password</i></div></label>
		    <input id="password" autocorrect="off" autocapitalize="none" autocomplete="off" type="text" name="password" size="18" style="font-size:24px"/>
		  </div>
		</td>
	      </tr>
	    </table>
	  </form>
	  <h1><font color="lightgray"><br>If you are having trouble connecting<br>
	      <span class="contactinfo_2line">please contact us</span></font></h1>
	</center>
      </div>
    </div>

    <div id="connected">
      <center>
	<br>
	<div>
	  <div style="height:18px">
	    <div id="checking">
	      <center>
		<h1><font color="lightgray">Checking connection...</font></h1>
	      </center>
	    </div>
	  </div>
	  <div style="width:300px;height:70px;display:inline-block;text-align:center;padding-top:6px">
	    <div id="stage-1-pending">
	      <font size="72px">➖ </font>
	      <br>
	      <br>
	      <h2>Internet</h2>
	    </div>
	    <div id="stage-1-good">
	      <font size="72px">✅ </font>
	      <br>
	      <br>
	      <h2>Internet connected</h2>
	    </div>
	    <div id="stage-1-bad">
	      <font size="72px">❓ </font>
	      <br>
	      <br>
	      <h2>Internet not connected</h2>
	    </div>
	  </div>

	  <div style="width:300px;height:70px;display:inline-block;text-align:center;padding-top:30px">
	    <div id="stage-2-pending">
	      <font size="72px">➖ </font>
	      <br>
	      <br>
	      <h2>Jibo</h2>
	    </div>
	    <div id="stage-2-good">
	      <font size="72px">✅ </font>
	      <br>
	      <br>
	      <h2>Jibo connected</h2>
	    </div>
	    <div id="stage-2-bad" onclick="client.popup_problem_panel()">
	      <font size="72px">❓ </font>
	      <br>
	      <br>
	      <h2>Jibo not connected</h2>
	    </div>
	  </div>

	  <div style="width:300px;height:70px;display:inline-block;text-align:center;padding-top:60px">
	    <div id="stage-3-pending">
	      <font size="72px">➖ </font>
	      <br>
	      <br>
	      <h2>Station Status</h2>
	    </div>
	    <div id="stage-3-good">
	      <font size="72px">✅ </font>
	      <br>
	      <br>
	      <h2>All Systems Go!</h2>
	    </div>
	    <div id="stage-3-bad" onclick="client.popup_problem_panel()">
	      <font size="72px">❓ </font>
	      <br>
	      <br>
	      <h2>There is a problem</h2>
	    </div>
	  </div>
	  <br>
	  <div id="contactus">
	    <center>
	      <h1><font color="lightgray"><br>There might be an issue with your station<br>
		  <span class="contactinfo">Please contact us</span></font></h1>
	      <br>
	    </center>
	  </div>

	  <template id="contactinfo_wellness">
	    Please contact us at<br>
	    jibo-wellness@media.mit.edu &nbsp; or &nbsp; 617-921-6515
	  </template>
	  <template id="contactinfo_2line_wellness">
	    please contact us at<br>
	    jibo-wellness@media.mit.edu<br>or &nbsp; 617-921-6515
	  </template>

	</div>

	<button onclick="client.disconnect_wifi()" class="normal discourage" style="position:absolute;right:62px;top:130px">
	  Disconnect<br>WiFi
	</button>
	<button id="setupagain" class="normal" onclick="client.disconnect_wifi()">
	  Try Setup Again
	</button>
	<br>
	<br>
	<br>
	<button id="done" class="normal" onclick="client.finished()">
	  Done
	</button>
      </center>
    </div>

    <div id="connecting">
      <div style="display:inline-block;width:600px;position:relative;top:-50px">
	<center>
	  <br>
	  <br>
	  <br>
	  <h1><span id="feedback"></span></h1>
	  <br>
	  <br>
	  <br>
	  <br>
	  <button class="normal" onclick="client.cancel_connecting()">
	    Cancel
	  </button>
	</center>
      </div>
    </div>

    <div id="disconnecting">
      <div style="display:inline-block;width:600px;position:relative;top:-50px">
	<center>
	  <br>
	  <br>
	  <br>
	  <h1>Disconnecting...</h1>
	</center>
      </div>
    </div>


    <div id="infobutton">
      <div id="clickinfo">
	<span style="font-size:42px;color:darkgray">ⓘ</span>
      </div>
    </div>

    <div id="infopanel">
      <div id="dismiss">
	<img src="cross.png" alt="dismiss" height="35" width="35">
      </div>
      <button onclick="client.reboot()" class="normal discourage" style="position:absolute;right:84px;top:160px">
	Reboot<br>Station
      </button>

      <br>
      <br>
      <br>
      <br>
      <br>
      <br>

      <center>
	<table style="width:700px;font-size:24px">
	  <tr>
	    <td style="width:200px;text-align:right">Uptime</td><td style="width:50px">&nbsp;</td><td style="width:400px"><div id="local_uptime">➖</div></td>
	  </tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="width:200px;text-align:right">Hostname</td><td style="width:50px">&nbsp;</td><td style="width:400px"><div id="local_hostname">➖</div></td>
	  </tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="text-align:right">Local IP address</td><td>&nbsp;</td><td><div id="local_ip_address">➖</div></td>
	  </tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="text-align:right">Rover IP address</td><td>&nbsp;</td><td><div id="rover_ip_address">➖</div></td>
	  </tr>
	  <tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="text-align:right">WiFi SSID</td><td>&nbsp;</td><td><div id="info_wifi_ssid">➖</div></td>
	  </tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="text-align:right">WiFi RSSI</td><td>&nbsp;</td><td><div id="info_wifi_rssi">➖</div></td>
	  </tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="text-align:right">Trim spaces</td><td>&nbsp;</td><td><input id="trim_spaces" type="checkbox" checked style="width:27px;height:27px"/></td>
	  </tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="text-align:right">Tolorate Ambiguity</td><td>&nbsp;</td><td><input id="expert_mode" type="checkbox" style="width:27px;height:27px"/></td>
	  </tr>
	  <tr style="height:15px"><td></td></tr>

	  <tr>
	    <td style="text-align:right">DHCP Leases</td><td>&nbsp;</td><td><div id="dhcp_leases">➖</div></td>
	  </tr>
	</table>

	<template name="dhcp_leases">
	  <table class="dhcp_leases">
	    <tr>
	      <td id="lease_time"></td><td id="mac_address"></td><td id="ip_address"></td><td id="dhcp_name"></td>
	    </tr>
	  </table>
	</template>

      </center>
    </div>

    <div id="turnjiboonpanel">
      <div id="dismiss">
	<img src="cross.png" alt="dismiss" height="35" width="35">
      </div>
      <center>
	<br>
	<br>
	<br>
	<br>
	<h1>Please turn on the Jibo Robot</h1><br>
	<br>
	<img src="jibopower.png" alt="jibo's power button" width="128" height="128">
	<h1><font color="lightgray"><span id="powerinstructions"><br>Please press the power button on the back of Jibo's head<br></span></font></h1>
	<br>
	<h1><font color="lightgray"><br>If you are having trouble<br>
	    <span class="contactinfo">please contact us</span></font></h1>
      </center>
    </div>

    <div id="restartstationpanel">
      <div id="dismiss">
	<img src="cross.png" alt="dismiss" height="35" width="35">
      </div>
      <center>
	<br>
	<br>
	<br>
	<br>
	<h1>Please restart your Jibo Station</h1><br>
	<br>
	<button onclick="client.reboot()" class="normal">
	  Restart Station
	</button>
	<br>
	<br>
	<h1><font color="lightgray"><span id="powerinstructions"><br>You Jibo station has a problem and needs to be restarted<br>
	      Please press the <font color="white">Restart Station</font> button above<br></span></font></h1>
	<br>
	<h1><font color="lightgray"><br>If you are having trouble<br>
	    <span class="contactinfo">please contact us</span></font></h1>
      </center>
    </div>

    <div id="donepanel">
      <div id="dismiss">
	<img src="cross.png" alt="dismiss" height="35" width="35">
      </div>
      <center>
	<br>
	<br>
	<br>
	<br>
	<br>
	<br>
	<br>
	<br>
	<br>
	<h1>Your Jibo Station is setup!</h1><br>
	<br>
	<h1><font color="lightgray"><span id="homeinstructions">Press the Home button on the tablet<br>to go back to the home screen</span></font></h1>
      </center>
    </div>

    
    <div id="noserverpanel">
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <h1>Looking for Jibo Station...</h1>
      <br>
      <br>
      <center>
	<h1><font color="lightgray"><br>Your station is still powering up<br><br>If this message is still here after 5 minutes<br>there might be an issue with your station<br>
	    <span class="contactinfo">Please contact us</span></font></h1>
	<br>
      </center>
    </div>


    <div id="rebootingpanel">
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <h1>Rebooting Jibo Station...</h1>
      <br>
      <br>
      <!--
	  <div id="contactus0">
	  </div>
	  -->
    </div>


  </section>
  <template class="connected noserver nostatus turnjiboonpanel restartstationpanel rebooting showinfopanel showdonepanel checking contactus contactus2 wifi-connected connecting disconnecting internet-connected internet-not-connected jibo-connected jibo-not-connected systems-connected systems-not-connected expert-mode flubby" style="display: none !important">
    <template id="noserverpanel"></template>
    <template id="checking"></template>
    <template id="connected"></template>
    <template id="connecting"></template>
    <template id="contactus"></template>
    <template id="contactus2"></template>
    <template id="disconnecting"></template>
    <template id="done"></template>
    <template id="donepanel"></template>
    <template id="infopanel"></template>
    <template id="notconnected"></template>
    <template id="rebootingpanel"></template>
    <template id="restartstationpanel"></template>
    <template id="setupagain"></template>
    <template id="stage-1-bad"></template>
    <template id="stage-1-good"></template>
    <template id="stage-1-pending"></template>
    <template id="stage-2-bad"></template>
    <template id="stage-2-good"></template>
    <template id="stage-2-pending"></template>
    <template id="stage-3-bad"></template>
    <template id="stage-3-good"></template>
    <template id="stage-3-pending"></template>
    <template id="turnjiboonpanel"></template>
  </template>
</div>



<style>
button.normal {
    color: white;
    font-weight: normal;
    text-decoration: none;
    word-break: break-word;
    font-size: 20px;
    line-height: 26px;
    border-top: 14px solid;
    border-bottom: 14px solid;
    border-right: 32px solid;
    border-left: 32px solid;
    background-color: #2ab27b;
    border-color: #2ab27b;
    display: inline-block;
    letter-spacing: 1px;
    min-width: 80px;
    text-align: center;
    border-radius: 4px;
    text-shadow: 0 1px 1px rgba(0,0,0,0.25);
}

button.discourage {
    border-top: 4px solid;
    border-bottom: 4px solid;
    border-right: 16px solid;
    border-left: 16px solid;
    background-color: darkred;
    border-color: darkred;
}

button.eyes {
    width: 30px;
    height: 30px;
    position: absolute;
    margin-left: 6px;
    margin-top: 5px;
    border-radius: 2px;
    border-width: 1px;
    background-color: #BBEBFF
}

#noserverpanel {
    display: none;
}

.noserver #noserverpanel,
.nostatus #noserverpanel {
    position: absolute;
    display: block;
    top: 0vh;
    right: 0vw;
    width: 100vw;
    min-width: 100vw;
    height: 100vh;
    background-color: #33546D;
}

#turnjiboonpanel,
#restartstationpanel {
    display: none;
}

.turnjiboonpanel #turnjiboonpanel,
.restartstationpanel #restartstationpanel {
    display: block;
    position: absolute;
    top: 0vh;
    right: 0vw;
    width: 100vw;
    min-width: 100vw;
    height: 100vh;
    background-color: #33546D;
}

#rebootingpanel {
    display: none;
}

.rebooting #rebootingpanel{
    display: block;
    position: absolute;
    top: 0vh;
    right: 0vw;
    width: 100vw;
    min-width: 100vw;
    height: 100vh;
    background-color: #33546D;
}

#infopanel {
    display: none;
}
.showinfopanel #infopanel {
    position: absolute;
    display: block;
    top: 0vh;
    right: 0vw;
    width: 100vw;
    min-width: 100vw;
    height: 100vh;
    background-color: #33546D;
}

#donepanel {
    display: none;
}
.showdonepanel #donepanel {
    position: absolute;
    display: block;
    top: 0vh;
    right: 0vw;
    width: 100vw;
    min-width: 100vw;
    height: 100vh;
    background-color: #33546D;
}


#checking,
#contactus2
{
    display: none;
}

.checking #checking
{
    display: block;
}

.contactus2 #contactus2
{
    display: block;
}

#infobutton {
    position: absolute;
    top: 30px;
    right: 80px;
}

#clickinfo {
    padding: 30px;
}


#dismiss {
    position: absolute;
    color: gray;
    padding: 14px 12px 8px 12px;
    top: 50px;
    right: 100px;
    border: solid 5px gray;
}


#notconnected {
    display: flex;
}
.wifi-connected #notconnected {
    display: none;
}
.connecting #notconnected {
    display: none;
}
.disconnecting #notconnected {
    display: none;
}

#connected {
    display: none;
}
.wifi-connected #connected {
    display: block;
}
.connecting #connected {
    display: none;
}
.disconnecting #connected {
    display: none;
}

#disconnecting {
    display: none;
}
.disconnecting #disconnecting {
    display: block;
}

#connecting {
    display: none;
}
.connecting #connecting {
    display: block;
}


#stage-1-pending {
    display: block;
}
#stage-1-good {
    display: none;
}
#stage-1-bad {
    display: none;
}
.internet-connected #stage-1-pending {
    display: none;
}
.internet-connected #stage-1-good {
    display: block;
}
.internet-connected #stage-1-bad {
    display: none;
}
.internet-not-connected #stage-1-pending {
    display: none;
}
.internet-not-connected #stage-1-good {
    display: none;
}
.internet-not-connected #stage-1-bad {
    display: block;
}

#stage-2-pending {
    display: block;
}
#stage-2-good {
    display: none;
}
#stage-2-bad {
    display: none;
}
.jibo-connected #stage-2-pending {
    display: none;
}
.jibo-connected #stage-2-good {
    display: block;
}
.jibo-connected #stage-2-bad {
    display: none;
}
.jibo-not-connected #stage-2-pending {
    display: none;
}
.jibo-not-connected #stage-2-good {
    display: none;
}
.jibo-not-connected #stage-2-bad {
    display: block;
}

#stage-3-pending {
    display: block;
}
#stage-3-good {
    display: none;
}
#stage-3-bad {
    display: none;
}
.systems-connected #stage-3-pending {
    display: none;
}
.systems-connected #stage-3-good {
    display: block;
}
.systems-connected #stage-3-bad {
    display: none;
}
.systems-not-connected #stage-3-pending {
    display: none;
}
.systems-not-connected #stage-3-good {
    display: none;
}
.systems-not-connected #stage-3-bad {
    display: block;
}
.jibo-not-connected #stage-3-pending {
    display: none;
}
.jibo-not-connected #stage-3-good {
    display: none;
}
.jibo-not-connected #stage-3-bad {
    display: block;
}

#contactus {
    display: none;
}

.contactus #contactus {
    display: block;
}

#setupagain {
    display: none !important;
}

:not(.expert-mode).contactus #setupagain {
    display: inline-block !important;
}

#done {
    display: none !important;
}

.systems-connected #done {
    display: inline-block !important;
}
.expert-mode #done {
    display: inline-block !important;
}

li.matched {
    background-color: gray !important;
}

form {
  max-width: 800px;
}

#sectionholder {
  font-family: sans-serif;
  scroll-snap-type: x mandatory;	
  display: flex;
  -webkit-overflow-scrolling: touch;
  overflow-x: scroll;
}

section {
  width: 100vw;
  min-width: 100vw;
  height: 100vh;
  /*border-right: 1px solid white;*/
  /*padding: 1rem;*/
  padding-top: 50px;
  scroll-snap-align: start;
  /*scroll-snap-stop: always;*/
  text-align: center;
  position: relative;
}

section:nth-child(even) {
    background-color: #13343D;
    /* https://www.colorhexa.com/006994  // old */
}
section:nth-child(odd) {
    background-color: #1B3C45;
}

.header {
    position:sticky;
    top:0;
    left:0;
    height:80px;
    z-index:900;
    width:100%;
}
</style>

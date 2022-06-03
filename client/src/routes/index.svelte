<script>
  import * as client from '$lib/client.js';
  import { onMount, onDestroy } from 'svelte';
  import Panel from '$lib/Panel.svelte';
  import InfoPanel from '$lib/InfoPanel.svelte';
  
  onMount(() => {
      client.init();
      window.client = client;
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
	    <span style="color:gray">connected to </span><span id="wifi_ssid">unknown</span>
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
        <div style="position:relative;top:-12px;flex:0 1 400px">
	  <div style="text-align:left;margin-bottom:12px">
	    <span style="color:lightgray">Visible networks &nbsp;<span style="color:gray">tap to select</span></span>
	  </div>
	  <div>
	    <div style="width:100%;height:50vh;text-align:left;overflow-y:scroll">
	      <ul width="300" id="network_list" style="width:450px;list-style:none;font-size:20px;font-weight:900;margin-left:2px;margin-top:4px;white-space:nowrap">
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
	      <table style="width:518px"> <!-- style="display:grid;place-items:center;background-color:#1B3C45"> -->

	        <tr style="width:100%">
                  <td style="height:50px;width:100">
                  </td>
                </tr>

	        <tr style="width:100%">
		  <td>
                  </td>
		  <td>
		    <div style="font-size:20px;font-weight:900">
		      <label for="ssid">Network Name</label><br>
		      <input id="ssid" autocorrect="off" autocapitalize="none" type="text" name="ssid" size="18" style="font-size:24px;margin-top:5px;" required/>
		    </div>
		  </td>
		  <td style="width:25px">
                  </td>
		  <td rowspan="4" style="padding-top:112px">
		    <span style="display: inline-block; border-radius: 4px; background: #1f8b5f; border-bottom: 2px solid #1f8b5f;">
		      <button id="connect" class="normal">
		        Connect WiFi
		      </button>
		    </span>
		  </td>
	        </tr>

	        <tr style="width:100%">
                  <td style="height:30px"></td>
                </tr>

	        <tr style="width:100%">
		  <td style="width:45px">
		    <button id="visibility" type="button" class="eyes" onclick="window.client.toggle_password_visibility(event)">👁️</button>
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
	    <h1><span style="color:lightgray"><br>If you are having trouble connecting<br>
	        <span class="contactinfo_2line">please contact us</span></span></h1>
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
		  <h1><span style="color:lightgray">Checking connection...</span></h1>
	        </center>
	      </div>
	    </div>
	    <div style="width:300px;height:70px;display:inline-block;text-align:center;padding-top:6px">
	      <div id="stage-1-pending">
	        <span style="font-size:72px">➖ </span>
	        <br>
	        <br>
	        <h2>Internet</h2>
	      </div>
	      <div id="stage-1-good">
	        <span style="font-size:72px">✅ </span>
	        <br>
	        <br>
	        <h2>Internet connected</h2>
	      </div>
	      <div id="stage-1-bad">
	        <span style="font-size:72px">❓ </span>
	        <br>
	        <br>
	        <h2>Internet not connected</h2>
	      </div>
	    </div>

	    <div style="width:300px;height:70px;display:inline-block;text-align:center;padding-top:30px">
	      <div id="stage-2-pending">
	        <span style="font-size:72px">➖ </span>
	        <br>
	        <br>
	        <h2>Jibo</h2>
	      </div>
	      <div id="stage-2-good">
	        <span style="font-size:72px">✅ </span>
	        <br>
	        <br>
	        <h2>Jibo connected</h2>
	      </div>
	      <div id="stage-2-bad" onclick="window.client.popup_problem_panel()">
	        <span style="font-size:72px">❓ </span>
	        <br>
	        <br>
	        <h2>Jibo not connected</h2>
	      </div>
	    </div>

	    <div style="width:300px;height:70px;display:inline-block;text-align:center;padding-top:60px">
	      <div id="stage-3-pending">
	        <span style="font-size:72px">➖ </span>
	        <br>
	        <br>
	        <h2>Station Status</h2>
	      </div>
	      <div id="stage-3-good">
	        <span style="font-size:72px">✅ </span>
	        <br>
	        <br>
	        <h2>All Systems Go!</h2>
	      </div>
	      <div id="stage-3-bad" onclick="window.client.popup_problem_panel()">
	        <span style="font-size:72px">❓ </span>
	        <br>
	        <br>
	        <h2>There is a problem</h2>
	      </div>
	    </div>
	    <br>
	    <div id="contactus">
	      <center>
	        <h1><span style="color:lightgray"><br>There might be an issue with your station<br>
		    <span class="contactinfo">Please contact us</span></span></h1>
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

	  <button onclick="window.client.disconnect_wifi()" class="normal discourage" style="position:absolute;right:62px;top:130px">
	    Disconnect<br>WiFi
	  </button>
	  <button id="setupagain" class="normal" onclick="window.client.disconnect_wifi()">
	    Try Setup Again
	  </button>
	  <br>
	  <br>
	  <br>
	  <button id="done" class="normal" onclick="window.client.finished()">
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
	    <button class="normal" onclick="window.client.cancel_connecting()">
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
      <Panel id="infopanel">
        <InfoPanel/>
      </Panel>


      <Panel id="turnjiboonpanel">
        <center>
	  <br>
	  <br>
	  <br>
	  <br>
	  <h1>Please turn on the Jibo Robot</h1><br>
	  <br>
	  <img src="jibopower.png" alt="jibo's power button" width="128" height="128">
	  <h1><span style="color:lightgray"><span id="powerinstructions"><br>Please press the power button on the back of Jibo's head<br></span></span></h1>
	  <br>
	  <h1><span style="color:lightgray"><br>If you are having trouble<br>
	      <span class="contactinfo">please contact us</span></span></h1>
        </center>
      </Panel>

      <Panel id="restartstationpanel">
        <center>
	  <br>
	  <br>
	  <br>
	  <br>
	  <h1>Please restart your Jibo Station</h1><br>
	  <br>
	  <button onclick="window.client.reboot()" class="normal">
	    Restart Station
	  </button>
	  <br>
	  <br>
	  <h1><span style="color:lightgray"><span id="powerinstructions"><br>You Jibo station has a problem and needs to be restarted<br>
	        Please press the <span style="color:white">Restart Station</span> button above<br></span></span></h1>
	  <br>
	  <h1><span style="color:lightgray"><br>If you are having trouble<br>
	      <span class="contactinfo">please contact us</span></span></h1>
        </center>
      </Panel>

      <Panel id="donepanel">
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
	  <h1><span style="color:lightgray"><span id="homeinstructions">Press the Home button on the tablet<br>to go back to the home screen</span></span></h1>
        </center>
      </Panel>

      <Panel id="noserverpanel" noclosebutton>
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
	  <h1><span style="color:lightgray"><br>Your station is still powering up<br><br>If this message is still here after 5 minutes<br>there might be an issue with your station<br>
	      <span class="contactinfo">Please contact us</span></span></h1>
	  <br>
        </center>
      </Panel>


      <Panel id="rebootingpanel" noclosebutton>
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
      </Panel>


  </section>
</div>


<style>
  button.normal {
    color: white;
    font-weight: normal;
    text-decoration: none;
    word-break: break-word;
    font-size: 18px;
    line-height: 26px;
    border-top: 14px solid;
    border-bottom: 14px solid;
    border-right: 28px solid;
    border-left: 28px solid;
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

#checking,
#contactus2
{
    display: none;
}

:global(.checking) #checking
{
    display: block;
}

:global(.contactus2) #contactus2
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


#notconnected {
  display:flex;
}
:global(.wifi-connected) #notconnected {
    display: none;
}
:global(.connecting) #notconnected {
    display: none;
}
:global(.disconnecting) #notconnected {
    display: none;
}

#connected {
    display: none;
}
:global(.wifi-connected) #connected {
    display: block;
}
:global(.connecting) #connected {
    display: none;
}
:global(.disconnecting) #connected {
    display: none;
}

#disconnecting {
    display: none;
}
:global(.disconnecting) #disconnecting {
    display: block;
}

#connecting {
    display: none;
}
:global(.connecting) #connecting {
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
:global(.internet-connected) #stage-1-pending {
    display: none;
}
:global(.internet-connected) #stage-1-good {
    display: block;
}
:global(.internet-connected) #stage-1-bad {
    display: none;
}
:global(.internet-not-connected) #stage-1-pending {
    display: none;
}
:global(.internet-not-connected) #stage-1-good {
    display: none;
}
:global(.internet-not-connected) #stage-1-bad {
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
:global(.jibo-connected) #stage-2-pending {
    display: none;
}
:global(.jibo-connected) #stage-2-good {
    display: block;
}
:global(.jibo-connected) #stage-2-bad {
    display: none;
}
:global(.jibo-not-connected) #stage-2-pending {
    display: none;
}
:global(.jibo-not-connected) #stage-2-good {
    display: none;
}
:global(.jibo-not-connected) #stage-2-bad {
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
:global(.systems-connected) #stage-3-pending {
    display: none;
}
:global(.systems-connected) #stage-3-good {
    display: block;
}
:global(.systems-connected) #stage-3-bad {
    display: none;
}
:global(.systems-not-connected) #stage-3-pending {
    display: none;
}
:global(.systems-not-connected) #stage-3-good {
    display: none;
}
:global(.systems-not-connected) #stage-3-bad {
    display: block;
}
:global(.jibo-not-connected) #stage-3-pending {
    display: none;
}
:global(.jibo-not-connected) #stage-3-good {
    display: none;
}
:global(.jibo-not-connected) #stage-3-bad {
    display: block;
}

#contactus {
    display: none;
}

:global(.contactus) #contactus {
    display: block;
}

#setupagain {
    display: none !important;
}

:global(:not(.expert-mode).contactus) #setupagain {
    display: inline-block !important;
}

#done {
    display: none !important;
}

:global(.systems-connected) #done {
    display: inline-block !important;
}
:global(.expert-mode) #done {
    display: inline-block !important;
}

</style>

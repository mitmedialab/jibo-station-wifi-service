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

  #dhcp_leases table {
    border-collapse: collapse;
  }
  #dhcp_leases tr.matched {
    background-color: gray !important;
  }
  #dhcp_leases td {
    font-size: 14px;
    padding-left: 8px;
    line-height: 17px;
  }
</style>

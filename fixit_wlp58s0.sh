#!/bin/bash

if [[ $(id -u) -ne 0 ]] ; then echo "please run as root" ; exit 1 ; fi

# disable the unique network interface names, go back to wlan0 & wlan1
echo "disabling complex names"
ln -s /dev/null /etc/udev/rules.d/80-net-setup-link.rules

# fix things to use the new simpler names
sed -i 's/wlp58s0/wlan0/' /etc/rc.local
sed -i 's/wlp58s0/wlan0/' /etc/hostapd/hostapd.conf
sed -i 's/wlp58s0/wlan0/' /etc/dnsmasq.conf
sed -i 's/wlp58s0/wlan0/' /etc/network/interfaces

sed -i 's/ [$]interface/ wlan1/' /etc/rc.local
sed -i 's/^interface=/#interface=/' /etc/rc.local

echo "installing dhcpcd5"
apt update
apt install dhcpcd5
systemctl enable dhcpcd

echo "configuring wpa_supplicant"
cat > /etc/wpa_supplicant.conf <<EOF
ctrl_interface=/var/run/wpa_supplicant
update_config=1
country=US
EOF

# attempt to transfer WiFi credentials
id="`ls -rt /etc/NetworkManager/system-connections | tail -1`"
file="/etc/NetworkManager/system-connections/$id"
ssid="`grep '^ssid=' $file | cut -d= -f2`"
psk="`grep '^psk=' $file | cut -d= -f2`"

echo ""
echo "**************************************"
echo ""
echo "got ssid $ssid and psk $psk"
if [[ -z "$ssid" || -z "$psk" ]]; then
    echo "not sure about the wifi info, so not setting it"
    echo "wifi will need to be reconfigured!"
else
    echo "adding to wpa_supplicant"
    (echo ""; wpa_passphrase "$ssid" "$psk") >> /etc/wpa_supplicant.conf
fi
echo ""
echo "**************************************"
echo ""

# can we do anything here to transfer the wifi credentials from NM to wpa?

cat > /etc/systemd/system/wpa_supplicant.service <<EOF
[Unit]
Description=WPA supplicant
Before=network.target
StartLimitIntervalSec=0

[Service]
Type=dbus
BusName=fi.epitest.hostap.WPASupplicant
Restart=always
RestartSec=1
ExecStart=/sbin/wpa_supplicant -u -s -O /run/wpa_supplicant -c/etc/wpa_supplicant.conf -iwlan1

[Install]
WantedBy=multi-user.target
Alias=dbus-fi.epitest.hostap.WPASupplicant.service
EOF

# probably not needed
systemctl enable wpa_supplicant.service

# diable Network Manager
#systemctl stop NetworkManager  # nah! probably don't wanna do this
for f in NetworkManager NetworkManager-wait-online.service NetworkManager-dispatcher.service network-manager.service; do
    echo "disabling $f"
    systemctl disable $f
done

echo "fixing wifi setup server to use wpa_supplicant"
# force wifi setup page to WPA, not NM
sed -i 's/const USE_NM =.*/const USE_NM = false;/' /usr/local/jibo-station-wifi-service/server.js

echo "done!"
read -p "reboot [y]? " yn
case $yn in
    ""|[yY]|yes|Yes|YES )
	reboot
	;;
    * )
	echo "not rebooting"
	;;
esac

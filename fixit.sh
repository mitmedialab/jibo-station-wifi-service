#!/bin/bash

if [[ $(id -u) -ne 0 ]] ; then echo "please run as root" ; exit 1 ; fi

# get usb interface name
interface=`ip address | egrep "^[0-9]+: " | cut -d: -f2 | egrep "wlx............"`
# get mac address of usb interface
oldmac=`ifconfig $interface | head -1 | cut -d" " -f6 | tr a-z A-Z`
echo "oldmac=$oldmac"
# use iw add temporarily to get mac address of new wl0
iw phy phy0 interface add wl0 type station
newmac=`ifconfig wl0 | head -1 | awk '{print $5}' | tr a-z A-Z`
echo "newmac=$newmac"

# change all old mac addresses to new mac address in NetworkManager
for f in /etc/NetworkManager/system-connections/*; do
    sed -i 's/$oldmac/$newmac/g' "$f"
done

# tweak NetworkManager systemd startup file to create new virtual interface
# add "ExecStartPre=-/sbin/iw phy phy0 interface add wl0 type station"
# after "ExecStart=" line
cp /lib/systemd/system/NetworkManager.service /etc/systemd/system/
sed -i '/ExecStart=/a ExecStartPre=-/sbin/iw phy phy0 interface add wl0 type station' /etc/systemd/system/NetworkManager.service

#change rc.local so jibo-station-wifi-service uses wl0 instead of $interface
sed -i 's/ [$]interface/ wl0/' /etc/rc.local

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

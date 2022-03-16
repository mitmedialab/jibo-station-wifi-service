#!/bin/bash

cd /usr/local/jibo-station-wifi-service || (echo "error!"; exit 1)

source ./activate

interface=$1

#if [ -z ${interface} ]; then
#    interface=`ip address | egrep "^[0-9]+: " | cut -d: -f2 | egrep "wlx............"`
#fi

if [ -z ${interface} ]; then
    if [ "`uname -p`" = "x86_64" ]; then
	# NUC
	interface="wlan1"
    else
	# Raspberry Pi
	interface="wlan0"
    fi
fi

echo "starting jibo-station-wifi-service on interface $interface"
NODE_ENV=production node $VIRTUALIZE_ROOT/server/src/main.js $interface

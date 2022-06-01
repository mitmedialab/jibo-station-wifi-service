#!/bin/bash

cd /usr/local/jibo-station-wifi-service || (echo "error!"; exit 1)

VIRTUALIZE_ACTIVATE_VIA_SCRIPT=1 source ./activate

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

cleanup() {
    kill 0
    exit
}

trap cleanup INT

echo "starting simple server in dev mode"

echo "starting sveltkit server in backgound"
(cd client && yarn dev) &

echo "starting jibo-station-wifi-service on interface $interface"
server/node_modules/.bin/nodemon --spawn --watch server /usr/local/jibo-station-wifi-service/server/src/main.js $interface

wait


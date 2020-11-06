#!/bin/bash

cd /usr/local/jibo-station-wifi-service || (echo "error!"; exit 1)

VIRTUALENV_ROOT=`pwd`
export VIRTUAL_ENV="`basename $VIRTUALENV_ROOT`"
export PATH=$VIRTUALENV_ROOT/bin:$VIRTUALENV_ROOT/node/bin:$PATH
export N_PREFIX=$VIRTUALENV_ROOT/node

interface=$1
if [ -z ${interface} ]; then
    interface=`ip address | egrep "^[0-9]+: " | cut -d: -f2 | egrep "wlx............"`
fi

echo "starting jibo-station-wifi-service on interface $interface"
while true; do
    node index.js $interface
    sleep 1;
done

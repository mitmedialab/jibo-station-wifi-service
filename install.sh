#!/bin/bash

VIRTUALENV_ROOT=`pwd`
export VIRTUAL_ENV="`basename $VIRTUALENV_ROOT`"
export PATH=$VIRTUALENV_ROOT/bin:$VIRTUALENV_ROOT/node/bin:$PATH
export N_PREFIX=$VIRTUALENV_ROOT/node

if [ "$VIRTUALENV_ROOT" != "/usr/local/jibo-station-wifi-service" ]; then
    echo "error: this needs to be installed into and run from /usr/local/jibo-station-wifi-service"
    exit 1
fi

mkdir node
git clone https://github.com/tj/n node/n
(export PREFIX=`pwd`/node; cd node/n; make; make install)
N_PREFIX=`pwd`/node node/bin/n 10.23


npm install -g yarn
yarn install

if [ ! -e /var/run/wpa_supplicant ]; then
    echo "don't forget to add ctrl_interface=/var/run/wpa_supplicant"
    echo "as the first line in /etc/wpa_supplicant.conf!"
fi

echo "done!"

exit



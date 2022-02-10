#!/bin/bash

VIRTUALENV_ROOT=`pwd`
export VIRTUAL_ENV="`basename $VIRTUALENV_ROOT`"
export PATH=$VIRTUALENV_ROOT/bin:$VIRTUALENV_ROOT/node/bin:$PATH
export N_PREFIX=$VIRTUALENV_ROOT/node

NODE_VERSION=16.13.1

if [ "$VIRTUALENV_ROOT" != "/usr/local/jibo-station-wifi-service" ]; then
    echo "error: this needs to be installed into and run from /usr/local/jibo-station-wifi-service"
    exit 1
fi

if [ ! -d node ]; then
    mkdir node
    git clone https://github.com/tj/n node/n
    (export PREFIX=`pwd`/node; cd node/n; make; make install)
    N_PREFIX=`pwd`/node node/bin/n $NODE_VERSION
    npm install -g yarn
fi

if [ -e node_modules ]; then
    echo "removing and reinstalling node modules"
    rm -rf node_modules
fi
yarn install

sudo cp -p jibo-station-wifi-service.service /etc/systemd/system
sudo systemctl enable jibo-station-wifi-service.service

if egrep "^/usr/local/jibo-station-wifi-service/" /etc/rc.local; then
    echo "disabling launching from /etc/rc.local"
    sudo sed -ie "s%^/usr/local/jibo-station-wifi-service/%#/usr/local/jibo-station-wifi-service/%" /etc/rc.local
fi

if [ ! -e /var/run/wpa_supplicant ]; then
    echo "don't forget to add ctrl_interface=/var/run/wpa_supplicant"
    echo "as the first line in /etc/wpa_supplicant.conf!"
fi

echo ""
echo "done!"

read -p "reboot [y]? " yn
case $yn in
    ""|[yY]|yes|Yes|YES )
	sudo reboot
	;;
    * )
	echo "not rebooting"
	;;
esac

exit

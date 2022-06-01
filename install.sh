#!/bin/bash

export VIRTUALIZE_NODE_VERSION=16.13.2
#export VIRTUALIZE_PYTHON_VERSION=3

# install git submodules
git submodule init
git submodule update
virtualize/install.sh

VIRTUALIZE_ACTIVATE_VIA_SCRIPT=1 source ./activate

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

read -p "Reboot? Choose no if you're in the middle of setting up a new NUC [y/n] " yn
case $yn in
    ""|[yY]|yes|Yes|YES )
	sudo reboot
	;;
    * )
	echo "not rebooting"
	;;
esac

exit

#!/bin/bash
SERVICE="jibo-station-wifi-service"
result=`ps aux | grep -i $SERVICE | grep -v "grep" | wc -l`
if [ $result -ge 1 ]
then
        echo "$SERVICE is running"
else
    echo "$SERVICE is not running. Reattempting..."
    interface=`ip address | egrep "^[0-9]+: " | cut -d: -f2 | egrep "wlx............"`
    iptables -t nat -A POSTROUTING -o $interface -j MASQUERADE
    iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
    iptables -A FORWARD -i wlp0s20f3 -o $interface -j ACCEPT

    iptables -t nat -A POSTROUTING -o eno1 -j MASQUERADE
    iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
    iptables -A FORWARD -i wlp0s20f3 -o eno1 -j ACCEPT

    /usr/local/jibo-station-wifi-service/start.sh $interface >/dev/null 2>&1 &
fi

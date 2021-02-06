#!/usr/sh

mkdir ~/.nitrogen
mkdir ~/.nitrogen/confs


i=0
while [ "$i" -le $TOR_COUNT ]; do
    cp /etc/tor/torrc.2 ~/.nitrogen/confs/torrc.2.${i}
    mkdir ~/.nitrogen/${i}.tor
    
    sed -i "s/^SocksPort 9060.*/SocksPort $((9060+${i}+1))/;s|^DataDirectory /var/lib/tor2|DataDirectory ~/.nitrogen/${i}.tor|" ~/.nitrogen/confs/torrc.2.${i}
    tor -f ~/.nitrogen/confs/torrc.2.${i} &

    i=$(( i + 1 ))
done 

sleep 60
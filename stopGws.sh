#!/bin/bash

# Define colors...
RED=`tput bold && tput setaf 1`
GREEN=`tput bold && tput setaf 2`
YELLOW=`tput bold && tput setaf 3`
BLUE=`tput bold && tput setaf 4`
NC=`tput sgr0`

function RED(){
	echo -e "\n${RED}${1}${NC}"
}
function GREEN(){
	echo -e "\n${GREEN}${1}${NC}"
}
function YELLOW(){
	echo -e "\n${YELLOW}${1}${NC}"
}
function BLUE(){
	echo -e "\n${BLUE}${1}${NC}"
}

#Stop front
sudo systemctl stop apache2 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    RED "Apache stopped"
else
    RED "Apache failed to stop"
    exit 1
fi

#Kill back
pkill node

if [ $? -eq 0 ]; then
    RED "Backend killed"
else
    RED "Backend failed to stop"
    exit 1
fi
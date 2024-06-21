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

# Testing if root...
if [ $UID -ne 0 ]
then
	RED "You must run this script as root!" && echo
	exit
fi


BLUE "Updating apt and fetching apache2 and php"
sudo apt update
sudo apt install -y apache2 php libapache2-mod-php

BLUE "Enabling ssl and rewrite"
sudo a2enmod ssl 
sudo a2enmod rewrite

GREEN "Done, all should work smoothly."
YELLOW "If something doesn't work on fresh linux install, update me, bye"


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
	RED "You must run this script as super user!" && echo
	exit
fi

# Installing apache2 and php
BLUE "Updating apt and fetching apache2 and php"
sudo apt-get update > /dev/null 2>&1
sudo apt install -y apache2 php libapache2-mod-php > /dev/null 2>&1

if [ $? -eq 0 ]; then
    GREEN "Apache2 and PHP installed successfully."
else
    RED "Failed to install Apache2 and PHP."
    exit 1
fi

# Installing postgres, creating db and user
BLUE "Installing PostgreSQL"
sudo apt install -y postgresql postgresql-contrib > /dev/null 2>&1

if [ $? -eq 0 ]; then
    GREEN "PostgreSQL installed successfully."
else
    RED "Failed to install PostgreSQL."
    exit 1
fi

# Starting PostgreSQL service
BLUE "Ensuring PostgreSQL service is running..."
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Ensure it starts on boot

# Wait a few seconds to make sure the service starts
sleep 5

BLUE "Creating PostgreSQL user and database"
DB_USER="gwsuser"
DB_PASS="gwsPasswordIsStrong2025"
DB_NAME="gwsproject"

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" > /dev/null 2>&1
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    GREEN "Database and user created successfully."
    RED "Default password has been set, make sure to change it for production"
else
    YELLOW "Already created, continuing...."
fi


# Enabling ssl and rewrite modules
BLUE "Enabling ssl and rewrite"
sudo a2enmod ssl > /dev/null 2>&1
sudo a2enmod rewrite > /dev/null 2>&1

if [ $? -eq 0 ]; then
    GREEN "SSL and rewrite modules enabled successfully."
else
    RED "Failed to enable SSL and rewrite modules."
    exit 1
fi

# Granting sudo access to user for specific command without password
YELLOW "In order for backend to run python workers as super user, we need to provide sudo rights to user that will run node backend:"
read -p "Enter the username to grant sudo access: " USERNAME
BLUE "Granting sudo access to $USERNAME for running Python script"
echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/python3 /opt/gwsProject/bait/bait.py --title * --template * --domain * --redirect * --tls *" | sudo tee /etc/sudoers.d/$USERNAME > /dev/null 2>&1

if [ $? -eq 0 ]; then
    GREEN "User $USERNAME can now run the script without a password."
else
    RED "Failed to grant sudo access."
    exit 1
fi

# Get the actual logged-in user (not root)
USER_HOME=$(eval echo ~$(logname))

# Adding alias for gws-start/gws-stop
BLUE "Setting up aliases for gws-start and gws-stop"

if [ -f "$USER_HOME/.bashrc" ]; then
    echo "alias gws-start='/opt/gwsProject/./startGws.sh'" | sudo tee -a "$USER_HOME/.bashrc" > /dev/null
    echo "alias gws-stop='/opt/gwsProject/./stopGws.sh'" | sudo tee -a "$USER_HOME/.bashrc" > /dev/null
    GREEN "Aliases 'gws-start/gws-stop' have been added to ~/.bashrc" 
    RED "REOPEN TERMINAL FOR CHANGES TO TAKE EFFECT"
fi

if [ -f "$USER_HOME/.zshrc" ]; then
    echo "alias gws-start='/opt/gwsProject/./startGws.sh'" | sudo tee -a "$USER_HOME/.zshrc" > /dev/null
    echo "alias gws-stop='/opt/gwsProject/./stopGws.sh'" | sudo tee -a "$USER_HOME/.zshrc" > /dev/null
    GREEN "Aliases 'gws-start/gws-stop' have been added to ~/.zshrc"
    RED "REOPEN TERMINAL FOR CHANGES TO TAKE EFFECT"
fi

# Installing NVM (Node Version Manager) and NODE -v 22

# Get the original user (the user who invoked sudo)
ORIGINAL_USER=$(logname)
ORIGINAL_HOME=$(eval echo ~$ORIGINAL_USER)

BLUE "Installing NVM and Node.js for user: $ORIGINAL_USER"

# Switch to the original user and install nvm + Node.js
sudo -u $ORIGINAL_USER bash << 'EOF'
# Define colors...
RED=$(tput bold && tput setaf 1)
GREEN=$(tput bold && tput setaf 2)
YELLOW=$(tput bold && tput setaf 3)
BLUE=$(tput bold && tput setaf 4)
NC=$(tput sgr0)

function RED() {
    echo -e "\n${RED}${1}${NC}"
}
function GREEN() {
    echo -e "\n${GREEN}${1}${NC}"
}
function YELLOW() {
    echo -e "\n${YELLOW}${1}${NC}"
}
function BLUE() {
    echo -e "\n${BLUE}${1}${NC}"
}

# Install NVM (Node Version Manager)
BLUE "Installing NVM..."
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash > /dev/null 2>&1

# Load NVM in the current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Verify that NVM is loaded
if command -v nvm > /dev/null 2>&1; then
    GREEN "NVM loaded successfully."
else
    RED "Failed to load NVM. Please check your shell configuration (e.g., ~/.bashrc or ~/.zshrc)."
    exit 1
fi

# Install Node.js version 22
BLUE "Installing Node.js version 22 using NVM..."
nvm install 22 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    GREEN "Node.js installed successfully using NVM."
else
    RED "Failed to install Node.js using NVM."
    exit 1
fi
EOF

# Verify installation for the original user
BLUE "Verifying installation for user: $ORIGINAL_USER"
sudo -u $ORIGINAL_USER bash << 'EOF'
# Define colors...
RED=$(tput bold && tput setaf 1)
GREEN=$(tput bold && tput setaf 2)
NC=$(tput sgr0)

function RED() {
    echo -e "\n${RED}${1}${NC}"
}
function GREEN() {
    echo -e "\n${GREEN}${1}${NC}"
}

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if command -v node > /dev/null 2>&1; then
    GREEN "Node.js installation verified successfully."
    GREEN "Node.js version: $(node --version)"
    GREEN "NPM version: $(npm --version)"
    cd /opt/gwsProject/api
    npm install > /dev/null 2>&1
else
    RED "Node.js installation verification failed, try installing it manually?"
    exit 1
fi
EOF

# Finally
GREEN "Done, all should work smoothly."
YELLOW "If something doesn't work on fresh linux install, update me, bye"

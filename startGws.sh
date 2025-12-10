#!/bin/bash

# Define colors...
GREEN=`tput bold && tput setaf 2`
BLUE=`tput bold && tput setaf 4`
NC=`tput sgr0`

function GREEN(){
	echo -e "\n${GREEN}${1}${NC}"
}
function BLUE(){
	echo -e "\n${BLUE}${1}${NC}"
}

# Variables
MANAGEMENT_DIR="/opt/gwsProject/mng"
TLS_DIR="/opt/gwsProject/mng/tls"
APACHE_CONFIG="/etc/apache2/sites-available/mng.conf"
PORT="8443"
MANAGEMENT_DOMAIN="domain.tld"

# Step 3: Create Apache configuration for the management center
echo "Creating Apache configuration for the management center..."
sudo bash -c "cat > $APACHE_CONFIG <<EOF
<VirtualHost *:$PORT>
    DocumentRoot $MANAGEMENT_DIR
    ServerName $MANAGEMENT_DOMAIN

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile $TLS_DIR/pub.pem
    SSLCertificateKeyFile $TLS_DIR/priv.pem
    SSLCertificateChainFile $TLS_DIR/int.pem

    <Directory $MANAGEMENT_DIR>
        AuthType Basic
        AuthName 'Auth required'
        AuthUserFile /etc/apache2/.htpasswd
        Require valid-user
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/mng_error.log
    CustomLog \${APACHE_LOG_DIR}/mng_access.log combined
</VirtualHost>
EOF"

# Step 4: Enable the new site and disable the default site
# echo "Enabling the management center site..."
sudo a2ensite mng.conf

# Step 5: Update Apache ports configuration
# echo "Updating Apache ports configuration..."
if ! grep -q "Listen $PORT" /etc/apache2/ports.conf; then
    echo "Listen $PORT" | sudo tee -a /etc/apache2/ports.conf > /dev/null
fi

# Step 6: Restart Apache to apply changes
# echo "Restarting Apache..."
BLUE "Starting the frontend..."
sudo systemctl restart apache2 > /dev/null 2>&1
GREEN "Management center is now served on https://$MANAGEMENT_DOMAIN:$PORT"
GREEN "If you have not, create management user: 'sudo htpasswd -c /etc/apache2/.htpasswd newUsername'"

# Step 7: Start the backend
BLUE "Starting the backend..."
cd "/opt/gwsProject/api/"

# Load NVM in the current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify that NVM is loaded
if command -v nvm > /dev/null 2>&1; then
    npm run prod > "/opt/gwsProject/api/logs/backend_$(date '+%d-%m-%Y_%H-%M-%S').log" 2>&1 &
    echo "Backend app started in the background."
else
    RED "Failed to load NVM, thus npm run failed as well. backend is not active."
    exit 1
fi

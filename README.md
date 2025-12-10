<h1 align="center">Great White Shark</h3>
<h3 align="center">Author: <a href="https://nikolazivkovic.me">bigfella</a></h3>

<p align="center">
<img src="./imgs/gwslogo-transparent.png" width="300" height="200" border="10"/>
</p>
<p align="center">Automated toolkit for conducting phishing campaigns</p>

<h3><p align="center">Disclaimer</p></h3>

<i align="center">Any actions and or activities related to <b>gwsProject</b> is solely your responsibility. The misuse of this toolkit can result in <b>criminal charges</b> brought against the persons in question. <b>The contributor will not be held responsible</b> in the event any criminal charges be brought against any individuals misusing this toolkit to break the law.</i>

<h3><p align="center">Description</p></h3>

<p align="center">Intended usage of this toolkit is to be of a assistance in delivering custom phishing campaigns in enterprise environments. Its core functionalities are completely automated with possibility of making manual changes in need of adaptation to a certain scenarios and delivering templates. It is operated through <b>GUI/CLI</b></p><br>

<h3><p align="center">Quick preview</p></h3>
<p align="center">
<img src="./imgs/demo.gif" border="10"/>
</p>


### Structure

Currently it has two modules:

- <b>Harpoon</b> - Used for sending customized, either html or plain text mass emails (with high alert, personalization and sender spoofing options)
- <b>Bait</b> - Used for setting up web server with chosen template, tracking clicks, hits and sucesfully sent emails per campaign.

### Usage
- Clone this repo inside /opt
```
git clone "https://github.com/goodfella-afk/gwsProject.git"
```


## GUI SETUP - details inside /bait and /harpoon
### Last tested on 04/March/2025 - 24.04 Ubuntu server

- You need to change a few variables:
  - /opt/gwsProject/mng/scripts/utils/global.js (<b>backend</b>)
  - /opt/gwsProject/startGws.sh (<b>MANAGEMENT_DOMAIN</b>)
  - Inside any food - change fetch to a correct backend domain.

- Have tls certificates in directories:
  - .../api/tls/
  - .../mng/tls/
  - .../bait/ssl (<b>optional</b>)
  
- Name your certs like following: int.pem, priv.pem, pub.pem
- ** !!! Gws will initialize psql db with default gwsuser credentials, for production purposes, change psql password and .env variables.**

- Run installRequirements.sh inside gwsProject directory
```
./installRequirements.sh
```
- Start / Stop gws using commands:
```
gws-start / gws-stop
```

## CLI USAGE (optional)
```
python3 $moduleNamectl.py
```

### Future updates: 
- New module: <b>Octopus</b> - Mimics your internal web application CMS/Admin panels.
- Feature: csv export per campaign / data analysis

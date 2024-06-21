<h1 align="center">Great White Shark</h3>
<h3 align="center">Author: <a href="https://nikolazivkovic.me">bigfella</a></h3>

<p align="center">
<img src="./imgs/gwslogo.png" width="300" height="200" border="10"/>
</p>
<p align="center">Automated toolkit for conducting phishing campaigns</p>

<h3><p align="center">Disclaimer</p></h3>

<i align="center">Any actions and or activities related to <b>gwsProject</b> is solely your responsibility. The misuse of this toolkit can result in <b>criminal charges</b> brought against the persons in question. <b>The contributor will not be held responsible</b> in the event any criminal charges be brought against any individuals misusing this toolkit to break the law.</i>

<h3><p align="center">Description</p></h3>

<p align="center">Intended usage of this toolkit is to be of a assistance in delivering custom phishing campaigns in enterprise environments. Its core functionalities are completely automated with possibility of making manual changes in need of adaptation to a certain scenarios and delivering templates. It is operated through <b>CLI</b>, with intention to make campaign statistics available on dynamic web application in future updates.</p><br>

### Structure

Currently it has two modules:

- <b>Harpoon</b> - Used for sending customized, either html or plain text mass emails (with high alert, personalization and sender spoofing options)
- <b>Bait</b> - Used for setting up web server with chosen template.

### Usage
- Clone this repo inside /opt
```
git clone "https://github.com/goodfella-afk/gwsProject.git"
```
- Run installRequirements.sh
```
./installRequirements.sh
```
- Go inside a wanted module and run:
```
python3 $moduleName.py
```

### Future updates: 
- New module: <b>Jaws</b> - Statistics/Chart tracker for previous campaigns and progress meter.
- New module: <b>CopyCat</b> - Mimics your internal web application CMS/Admin panels.
- Improvement: Think about implementing 2nd step for MFA bypass.
- Compliance: GDPR - tokenize collected passwords.

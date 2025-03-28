import smtplib
import getpass
from string import Template
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from helpers.readtemplate import read_template
from helpers.getcontacts import get_contacts
from email.utils import formataddr
import argparse
from datetime import datetime
import json
import requests

def log_sent_mail(logpath, email, template, timestamp):
    with open(logpath, 'a') as logfile:
        logfile.write(f'Mail to {email} using template: {template}, is successfully sent at: {timestamp}\n')
    

def harpoon(smtpuserArg, smtppassArg, smtphostArg, templateArg, domainArg, campaignArg, subjectArg, smtpspoofArg):

    smtpusername = smtpuserArg
    smtppassword = smtppassArg 
    smtphost = smtphostArg 
    emailTemplate = templateArg 
    smtpport = 587
    subject = subjectArg
    spoofedsender = smtpspoofArg 
    domain = domainArg
    campaign = campaignArg
    logpath = f'/opt/gwsProject/harpoon/logs/{campaign}.log'

    names, emails = get_contacts('/opt/gwsProject/harpoon/assets/mycontacts.txt') # read contacts
    message_template = read_template(f'/opt/gwsProject/harpoon/assets/{emailTemplate}')


    # set up the SMTP server
    s = smtplib.SMTP(host=smtphost, port=smtpport)
    s.starttls()
    s.login(smtpusername, smtppassword)
    
    if emailTemplate.endswith("html"):
        template = 'html'
    else:
        template = 'plain'
    
    # For each contact, send the email:
    for name, email in zip(names, emails):
        timestamp = datetime.today().strftime('%d-%m-%Y-%H-%M-%S')

        msg = MIMEMultipart()       # create a message
        # add in the actual person name to the message template
        message = message_template.substitute(PERSON_NAME=name.title(), DOMAIN=domain, EMAIL=email)
        # dynamic domain (forwarding campaignId via dataset, find matching campaign and extract domain)
        # message = message_template.substitute(DOMAIN=domain)


        # setup the parameters of the message
        msg['From']= formataddr((spoofedsender, smtpusername))
        msg['To']=email
        msg['Subject']=subject
        msg['X-Priority'] = '2'

        # add in the message body
        msg.attach(MIMEText(message, template))

        # send the message via the server set up earlier.
        s.send_message(msg)
        del msg

        # Log in file 
        log_sent_mail(logpath, email, emailTemplate, timestamp)

        # Log in psql - send as array because we are validation ifArray on backend + appending to existing
        log_detail = [{
            "toEmail" : email,
            "emailTemplate" : emailTemplate,
            "timestamp" : timestamp
        }]

        updateLogs(campaign, log_detail)
        # logs.append(log_detail)

    # Terminate the SMTP session and close the connection
    s.quit()

# Update logs inside psql
def updateLogs(campaign, log_detail):
    proxies = {
        "http" : None,
        "https" : None,
    }

    url = f'https://localhost:5000/api/harpoon/updateLogs?campaignTitle={campaign}'
    headers = {"Content-Type":"application/json"}

    #Send POST
    try:
        response = requests.post(url, json=log_detail, headers=headers, verify=False, proxies=proxies)

        #Check response
        if response.status_code == 200:
            print("Log sent sucessfully")
        else:
            print(f"Failed to send logs, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error happened while sending request for updating logs {e}")

def main():

    parser = argparse.ArgumentParser(description="Sending mails")

    # Define args
    parser.add_argument('--smtpuser', type=str, required=True, help="SMTP Username")
    parser.add_argument('--smtppass', type=str, required=True, help="SMTP Pass")
    parser.add_argument('--smtphost', type=str, required=True, help="SMTP Host")
    parser.add_argument('--template', type=str, required=True, help="emailTemplate title")
    parser.add_argument('--domain', type=str, required=True, help="Your campaign.data.domain")
    parser.add_argument('--campaign', type=str, required=True, help="Your campaign.data.title")
    parser.add_argument('--subject', type=str, required=True, help="Email Subject")
    parser.add_argument('--smtpspoof', type=str, required=True, help="FROM: eg. John Doe johndoe@mail.com")

    # Parse the args

    args = parser.parse_args()

    #Call harpoon()
    harpoon(args.smtpuser, args.smtppass, args.smtphost, args.template, args.domain, args.campaign, args.subject, args.smtpspoof)

if __name__ == '__main__':
    main()

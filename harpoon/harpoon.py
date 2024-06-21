import smtplib
import getpass
from string import Template
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from helpers.readhtmltemplate import read_html_template
from helpers.readplaintemplate import read_plain_template
from helpers.getcontacts import get_contacts
from email.utils import formataddr

#smtpusername = 'iLikeManual'
#smtppassword = 'app-password/recvconnector'
#smtphost = 'smtp.mail.me.com'
#smtpport = 587

smtpusername = input("SMTP Username [ie. username@domain.com]: ")
smtppassword =  getpass.getpass(prompt='SMTP Password: ', stream=None)
smtphost =  input("SMTP host: [ie. smtp.gmail.com]: ")
template = input("Are you sending html or plain-text [ie. html/plain]: ")
smtpport = 587
subject = input("Email subject [ie. Important service updates]: ")
spoofedsender = input("Name of a person you want to impersonate [ie. John Doe support@microsoft.com]: ")

def main():
    names, emails = get_contacts('assets/mycontacts.txt') # read contacts
    if template == 'html':
        message_template = read_html_template('assets/html.txt')
    else: 
        message_template = read_plain_template('assets/plain.txt')
    # set up the SMTP server
    s = smtplib.SMTP(host=smtphost, port=smtpport)
    s.starttls()
    s.login(smtpusername, smtppassword)

    # For each contact, send the email:
    for name, email in zip(names, emails):
        msg = MIMEMultipart()       # create a message

        # add in the actual person name to the message template
        message = message_template.substitute(PERSON_NAME=name.title())

        # Prints out the message body for our sake
        print("Mail to '" + email + "' is successfully sent.") 

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

    # Terminate the SMTP session and close the connection
    s.quit()

if __name__ == '__main__':
    main()

import { spawn } from 'child_process';

// @desc run bait.py with arguments 
// @TODO - serve multiple campaigns simultaniously

export const runBaitPy = (campaignData) => {

  const pythonProcess = spawn('sudo', ['python3', 
    '/opt/gwsProject/bait/bait.py',
    '--title', campaignData.title,
    '--template', campaignData.bait,
    '--domain', campaignData.domain,
    '--redirect', campaignData.redirect,
    '--tls', campaignData.tls]);

  // Collect the output from the Python script
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Output: ${data}`);
  });

  // Capture any errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

}

export const runHarpoonPy = (data, domain, campaignTitle) => {
  const pythonProcess = spawn('python3', [
    '/opt/gwsProject/harpoon/harpoon.py',
    '--smtpuser', data.smtpuser,
    '--smtppass', data.smtppass,
    '--smtphost', data.smtphost,
    '--template', data.emailTemplateTitle,
    '--domain', domain,
    '--campaign', campaignTitle,
    '--subject', data.subject,
    '--smtpspoof', data.smtpspoof
  ]);

  // Collect the output from the Python script
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Output: ${data}`);
  });

  // Capture any errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

}
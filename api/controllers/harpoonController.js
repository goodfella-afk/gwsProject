import sequelize from "../configs/config.js";
import harpoonTemplatesTableModel from '../models/sequelize/harpoon.js';
import fs from 'fs';
import { runHarpoonPy } from "./pythonController.js";
import campaignsTableModel from "../models/sequelize/campaigns.js";
import { Op } from 'sequelize';

// @desc Campaign CLASS
class EmailTemplate {
  constructor(req) {
    this.title = req.title;
    this.isHtml = req.isHtml;
    this.content = req.content;
  }
  correctTitle() {
    if (this.isHtml == 'true') { 
      this.title = `${this.title}.html`;
    }
    else {
      this.title = `${this.title}.txt`;
    }
  }
}

// @desc HarpoonData CLASS
class HarpoonData {
  constructor(req) {
    this.smtpuser = req.smtpuser;
    this.smtppass = req.smtppass;
    this.smtphost = req.smtphost;
    this.emailTemplateTitle = req.emailTemplateTitle;
    this.campaignId = req.campaignId;
    this.subject = req.subject;
    this.smtpspoof = req.smtpspoof;
    this.contacts = req.contacts;
  }
}


// @desc Sequelize db controller for CREATING NEW email template.
// @route POST /api/harpoon/createEmailTemplate
export const createEmailTemplate = (req, res, next) => {

  const writeTemplateInDatabase = async (emailTemplateData) => {
    emailTemplateData.correctTitle();

    // Write in filesystem firt, if all good - add that to database as well.
    try {
      const filePath = `/opt/gwsProject/harpoon/assets/${emailTemplateData.title}` 
      if (!fs.existsSync(filePath)) {
        fs.writeFile(filePath, emailTemplateData.content, async (err) => {
          if (err) {
            console.error('Error creating file:', err);
          } else {
            const record = await harpoonTemplatesTableModel.create({ title:emailTemplateData.title, isHtml:emailTemplateData.isHtml, content:emailTemplateData.content});
            console.log(`File and db record "${emailTemplateData.title} created and written into sucessfully`)
            res.status(200).send(`Created email template with title -> ${emailTemplateData.title}`);
          }
        })
      }

      else {
        console.error(`Template with that name: ${emailTemplateData.title} already exists`);
        res.status(500).json({'error-message':'Template with that title already exists'});
      }
    }

    catch (error) {
    res.status(500).send(`Error happened while trying to create email template -> ${emailTemplateData.title}`);
    }
  }

  const EmailTemplateData = new EmailTemplate(req.body);
  writeTemplateInDatabase(EmailTemplateData);
}
    


// @desc Return JSON of all emailTemplates
// @route GET /api/harpoon/getEmailTemplates
export const getEmailTemplates = async (req, res, next) => {
  try {
   const emailTemplates = await harpoonTemplatesTableModel.findAll();
   res.status(200).json(emailTemplates);
  } catch (error) {
    throw new Error('Failed to fetch emailTemplates from db');
  }
}


// @desc deleteEmailCampaign, delButtonUniq will pass as arg templates id
// @route POST /api/harpoon/deleteEmailTemplate
export const deleteEmailTemplate = (req, res, next) => {
 
  const deleteEmailTemplate = async (req) => {

    const templateTitle = req.body;
    const filePath = `/opt/gwsProject/harpoon/assets/${templateTitle}`;

    try {

      const emailTemplate = await harpoonTemplatesTableModel.findOne({
        where: { title: templateTitle },
      });

      if (!emailTemplate) {
        return res.status(404).json({ 'Error': `Email template with title: ${templateTitle} not found`});
      }

      await emailTemplate.destroy();
      res.status(200).send(`Deleted email template with title -> ${templateTitle}.html`);

    } catch (error) {
      console.error('deleteEmailTemplate route controller failed');
    }

    fs.unlinkSync(filePath);
  }

  deleteEmailTemplate(req);
}

// @desc sendEmailJob, form will pass required args for running python 
// @route POST /api/harpoon/sendEmailJob
export const sendEmailJob = (req, res, next) => {
  const sendEmailJob = async (data) => {
    const campaign = await campaignsTableModel.findOne({
      where: {id: data.campaignId},
    })

    // Get domain for python-job
    const domain = (campaign.data.tls == 'y') ? `https://${campaign.data.domain}` : `http://${campaign.data.domain}`

    // Edit mycontacts
    fs.writeFile('/opt/gwsProject/harpoon/assets/mycontacts.txt', data.contacts, async (err) => {
      if (err) {
        console.error('Error writing to mycontacts', err);
      }
    })

    // Run python job
    runHarpoonPy(data, domain, campaign.data.title);


    res.status(200).send('bravo');
  }

  const data = new HarpoonData(req.body);
  sendEmailJob(data);
}

// @desc updateLogs, update sent email logs (python will request)
// @route POST /api/harpoon/updateLogs
export const updateLogs = (req, res, next) => {
  const updateLogs = async (req) => {
    try {
      // Extract campaignTitle from query parameters
      const campaignTitle = req.query.campaignTitle;

      if (!campaignTitle) {
        return res.status(400).json({ error: 'campaignTitle is required as a query parameter' });
      }

      // Fetch the existing record
      const campaign = await campaignsTableModel.findOne({
        where: {
          data: {
            [Op.contains]: { title: campaignTitle } // Query nested JSON property
          }
        }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Ensure req.body is an array (for logs)
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: 'Request body must be a JSON array' });
      }

      // Append the new logs to the existing logs (if logs exist)
      const updatedData = {
        ...campaign.data, // Spread the existing data
        logs: [...(campaign.data.logs || []), ...req.body] // Append the new logs
      };

      // Update the campaign data
      campaign.data = updatedData;
      await campaign.save();

      // Send a success response
      res.status(200).json({ message: 'Logs updated successfully', campaign });
    } catch (error) {
      console.error('Error updating logs', error);
      res.status(500).json({ error: 'Error updating logs' });
    }
  };

  updateLogs(req);
}
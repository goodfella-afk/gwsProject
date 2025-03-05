import express from 'express';
import { createEmailTemplate, getEmailTemplates, deleteEmailTemplate, sendEmailJob, updateLogs } from '../controllers/harpoonController.js';

// Global vars

// Initialize
const router = express.Router();


// Create new email template
router.post('/createEmailTemplate', createEmailTemplate);

// Get stored email templates
router.get('/getEmailTemplates', getEmailTemplates);

// Delete email template button
router.post('/deleteEmailTemplate', deleteEmailTemplate);

// Send emails job
router.post('/sendEmailJob', sendEmailJob);

// Update sent email logs
router.post('/updateLogs', updateLogs);

export default router;
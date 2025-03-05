import express from 'express';
import { createCampaign, deleteCampaign, getCampaigns, updateHits, updateClicks} from '../controllers/campaignController.js';

// Global vars

// Initialize
const router = express.Router();

// Get all Campaigns
router.get('/getCampaigns', getCampaigns);


// Create new campaign
router.post('/createCampaign', createCampaign);

// Update campaign hits data on event collectorChange
// Change to POST + postData = collector new lines
router.post('/updateHits', updateHits); 

// Update clicks (issued directly from clients bait opened)
router.post('/updateClicks', updateClicks);

// Delete Campaign button
router.post('/deleteCampaign', deleteCampaign);


export default router;
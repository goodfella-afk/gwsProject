import { runBaitPy } from "./pythonController.js";
import sequelize from "../configs/config.js";
import campaignsTableModel from '../models/sequelize/campaigns.js';

import fs from 'fs';
import path from 'path';
import { text } from "stream/consumers";

// @desc Campaign CLASS
class Campaign {
  constructor(req) {
    this.title = req.title;
    this.bait = req.bait;
    this.domain = req.domain;
    this.redirect = req.redirect;
    this.dateStarted = Date();
    this.dateEnded = undefined;
    this.hits = [];
    this.clicks = [];
    this.logs = [];
    this.tls = req.tls;
  }
}

// @desc Sequelize db controller for CREATING NEW campaign.
// @route POST /api/campaigns/createCampaign
export const createCampaign = (req, res, next) => {


  const writeCampaignInDatabase = async (campaignData) => {

    try {
      const record = await campaignsTableModel.create({ data: campaignData});
      try {
        runBaitPy(campaignData);
        res.status(200).json('Campaign created and stored inside')
      } catch (error) {
        error.log(error);
        res.status(500).json('Failed Starting Campaign')
      }

    } catch (error) {
      error.status = 500;
      return next(error);
    }
  }

  const campaignData = new Campaign(req.body);
  writeCampaignInDatabase(campaignData);

}

// @desc Return JSON of all campaigns
// @route GET /api/campaigns/getCampaigns
export const getCampaigns = async (req, res, next) => {

  try {
   const campaigns = await campaignsTableModel.findAll();
   res.status(200).json(campaigns);
  } catch (error) {
    throw new Error('Failed to fetch campaigns from db');
  }
}

// @desc deleteCampaign, delButtonUniq will pass as arg campaigns id
// @route POST /api/campaigns/deleteCampaign
export const deleteCampaign = (req, res, next) => {
 
  const delCampaign = async (req) => {

    try {

        const campaignId = req.body;

        const campaign = await campaignsTableModel.findOne({
          where: { id: campaignId },
        });

        if (!campaign) {
          return res.status(404).json({ 'Error': `Campaign with id ${campaignId} not found`});
        }

        await campaign.destroy();
        res.status(200).send(`Deleted Campaign with id -> ${campaignId}`);

    } catch (error) {
      console.error('DeleteCampaign route controller failed');
    }
  }

  delCampaign(req);
}


//@desc update campaign HITS upon clicking refresh button inside GUI
//@route POST /api/campaigns/updateCampaign
export const updateHits = (req, res, next) => {

  const updateHits = async (req) => {

    try {
      const campaignId = req.body;
      // Find live campaign as there could be only 1 up.
      const lastId = await campaignsTableModel.max('id');

        // Fetch the existing record
      const campaign = await campaignsTableModel.findOne({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaignId < lastId) {
        return res.status(500).json({'Error':'Could not update hits for campaign that is not alive - backend validation error'})
      }

      // COLLECTOR PATH - Will be dynamic bound to collector + req.body.title + .txt
      const filePath = path.join('/var/www/html', `collector_${campaign.data.title}.txt`);

      // OPEN COLLECTOR FOR DATA PARSING
      fs.readFile(filePath, 'utf-8', (err, data) => {

        if (err) {
            console.error(`Error reading collector file: ${err.message}`);
            return;
        }

        data = data.slice(0,-2);
        data = `[${data}]`;
        const newHit = JSON.parse(data);
        
        // Append the new hit to the `hits` array
        const updatedData = {
          ...campaign.data, // Spread the existing data
          // hits: [...campaign.data.hits, newHit], // Append the new hit instead changing whole line - if needed.
          hits: newHit, // Append the new hit
        };

        // Save the updated record
        campaign.data = updatedData;
        saveUpdatedCampaign(campaign);

      });

    } 

    catch (error) {
      console.error('Error updating hits', error);
      res.status(500).json('Error updating hits');
    }
  };

  const saveUpdatedCampaign = async (campaign) => {
    await campaign.save();
    console.log(campaign);
    res.status(200).json('record updated and saved');
  }

  updateHits(req);

}


//@desc update clicks - initiated from bait(client) side
//@route POST /api/campaigns/updateCampaign
export const updateClicks = (req, res, next) => {

  const updateClicks = async (req) => {

    try {
      // Find live campaign as there could be only 1 up.
      const lastId = await campaignsTableModel.max('id');

        // Fetch the existing record
      const campaign = await campaignsTableModel.findOne({
        where: { id: lastId },
      });

      if (!campaign) {
        throw new Error('Campaign not found, bad campaignId passed');
      }

      const newClick = req.body;
      
      // Append the new click to the `clicks` array
      const updatedData = {
        ...campaign.data, // Spread the existing data
        // hits: [...campaign.data.hits, newHit], // Append the new hit instead changing whole line - if needed.
        clicks: [...campaign.data.clicks, {"clicked": newClick}], // Append the new hit
      };

      // Save the updated record
      campaign.data = updatedData;
      await campaign.save();
      res.status(200).json({"Success":"Clicks updated"})

    } 

    catch (error) {
      console.error('Error updating clicks', error);
      res.status(500).json('Error updating clicks');
    }
  };

  updateClicks(req);

}
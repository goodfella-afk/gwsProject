import { backend } from "../utils/global.js";

export let campaigns = [];

export const fetchCampaigns = async () => {
  try {
    const response = await fetch(
      `${backend}:5000/api/campaigns/getCampaigns`,
      {
        method:'GET',
        headers:{
          'Content-Type':'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error while retrieving response from /api/campaigns/getCampaigns');
    }

    campaigns = await response.json();
    campaigns.reverse();
    console.log('I fetched current campaigns');

  } catch (error) {
    throw new Error('Error while trying to send GET request to backend API for fetching all campaigns')  
  }
}

export const deleteCampaign = async (delButtonUniq) => {
  try {
    const response = await fetch(
      `${backend}:5000/api/campaigns/deleteCampaign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: delButtonUniq, // Send it as text/plain
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete campaign');
    }

    console.log(`Campaign ${delButtonUniq} deleted!`);

  } catch (error) {
    console.error('Error happened while trying to send POST to /api/campaigns/deleteCampaign');
  }
};

export const updateHits = async (campaignId) => {
  try {
    const response = await fetch(
      `${backend}:5000/api/campaigns/updateHits`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: campaignId, // Send it as text/plain
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update hits');
    }

    console.log(`We sent campaign id ${campaignId} for hits update, if that campaign is live, its hits will get updated`);

  } catch (error) {
    console.error('Error happened while trying to send POST to /api/campaigns/updateHits');
  }
};
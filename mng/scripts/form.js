import { renderOpenCampaignWindowHTML } from "./campaign.js";
import { renderOpenHarpoonWindowHTML } from "./harpoon.js";
import { backend } from "./utils/global.js";

// Send data to backend for bait.py
export async function createCampaign(e) {
  if (
    confirm(
      'If you create new campaign, previous one will end and get archived, are you sure you want to proceed?'
    )
  ) {
    e.preventDefault();

    const form = e.target;
    const campaignData = new FormData(form);
    // If i want to .get partial form data (maybe later)
    // const title = campaignData.get('title');
    // const bait = campaignData.get('bait');
    // const domain = campaignData.get('domain');
    // const redirect = campaignData.get('redirect');
    try {
      const res = await fetch(
        `${backend}:5000/api/campaigns/createCampaign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // body: JSON.stringify({body})
          body: JSON.stringify(Object.fromEntries(campaignData)),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to create campaign');
      }

      console.log('uspjesno poslat');
    } catch (error) {
      console.error('error happened');
    }
  } else {
    renderOpenCampaignWindowHTML();
    // history.back();
  }
}

// Create email template data to backend -> psql storage
export async function createEmailTemplate(e) {
  if (
    confirm(
      'You are about to create a new email template, are you sure?'
    )
  ) {
    e.preventDefault();

    const form = e.target;
    const templateData = new FormData(form);

    try {
      const res = await fetch(
        `${backend}:5000/api/harpoon/createEmailTemplate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // body: JSON.stringify({body})
          body: JSON.stringify(Object.fromEntries(templateData)),
        }
      );

      if (!res.ok) {
        throw new Error(`email template with that title already exists`);
      }

      console.log('Success, email template data forwarded to backend');
    } catch (error) {
      console.error(error);
    }
  } else {
    renderOpenHarpoonWindowHTML();
  }
}

// Send data for python job
export async function sendEmail(e) {

  if (
    confirm(
      'You are about to start sending emails, proceed?'
    )
  ) {
    e.preventDefault();

    const form = e.target;
    const templateData = new FormData(form);

    try {
      const res = await fetch(
        `${backend}:5000/api/harpoon/sendEmailJob`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // body: JSON.stringify({body})
          body: JSON.stringify(Object.fromEntries(templateData)),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed starting sendEmail`);
      }

      console.log('Success - sendEmail form data sent to backend');
    } catch (error) {
      console.error(error);
    }
  } else {
    renderOpenHarpoonWindowHTML();
  }
}
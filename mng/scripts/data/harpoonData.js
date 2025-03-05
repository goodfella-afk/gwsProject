import { backend } from "../utils/global.js";

export let emailTemplates = [];

export const fetchEmailTemplates = async () => {
  try {
    const response = await fetch(
      `${backend}:5000/api/harpoon/getEmailTemplates`,
      {
        method:'GET',
        headers:{
          'Content-Type':'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error while retrieving response from /api/harpoon/getEmailTemplates');
    }

    emailTemplates = await response.json();
    emailTemplates.reverse();
    console.log('I fetched current email templates');

  } catch (error) {
    throw new Error('Error while trying to send GET request to backend API for fetching current email templates')  
  }
}

export const deleteEmailTemplate = async (delButtonUniq) => {
  try {
    const response = await fetch(
      `${backend}:5000/api/harpoon/deleteEmailTemplate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: delButtonUniq, // Send it as text/plain
      }
    );


    if (!response.ok) {
      throw new Error('Failed to delete email template');
    }

    console.log(`Email template with title:${delButtonUniq} deleted!`);

  } catch (error) {
    console.error('Error happened while trying to send POST to /api/harpoon/deleteEmailTemplate');
  }
};
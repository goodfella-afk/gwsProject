import { updateTime, closeWindow } from "./utils/windowing.js";
import { fetchCampaigns, deleteCampaign, updateHits, campaigns } from "../scripts/data/campaignsData.js";
import { createCampaign } from "../scripts/form.js";

// Date and Time at the top bar
updateTime();

// INITIAL FIRST CLICK ON BAIT MODULE ICON
document.querySelector('.js-bait-icon').addEventListener('click', async () => {

  await fetchCampaigns();
  renderOpenCampaignWindowHTML();

});

// WINDOW PLACEHOLDER HTML RENDER
export const renderOpenCampaignWindowHTML = () => {
  let openCampaignWindowHtml = `      <div class="window">
        <div class="window-header">
            <div class="nav-buttons">
                <button class="nav-back js-nav-back">←</button>
                <button class="nav-forward">→</button>
                <button class="nav-refresh js-nav-refresh">↻</button>
            </div>
            <div class="window-title">Campaigns</div>
            <div class="window-controls">
                <button class="js-window-minimize">●</button>
                <button class="js-window-maximize">●</button>
                <button class="js-window-close">●</button>
            </div>
        </div>
        <div class="window-content js-window-content">
          <!-- First Row - Centered PLUS icon -->
              <div class="content-row plus-row">
                  <button class="plus-icon js-plus-icon">+</button>
              </div>
              ${renderCampaignPreviewGridHTML()}
        </div>
      </div>
      `

  document.querySelector('.js-window-wrapper').innerHTML = openCampaignWindowHtml;
  document.querySelector('.js-window-close').addEventListener('click', closeWindow);
  document.querySelector('.js-nav-back').addEventListener('click', renderOpenCampaignWindowHTML);
  document.querySelector('.js-plus-icon').addEventListener('click', renderFormPromptHTML);
  document.querySelector('.js-nav-refresh').addEventListener('click', async () => {
    await fetchCampaigns();
    renderOpenCampaignWindowHTML();
  });

  handleButtonEvents();
}

// CAMPAIGN VIEW INSIDE WINDOW HTML RENDER
const renderCampaignPreviewGridHTML = () => {
  let campaignPreviewGridHTML = ``;

  campaigns.forEach((campaign, index) => {

    campaignPreviewGridHTML += `
      <div class="content-row">
          <div class="row-title">
            ${(index == 0) ? '🟢' : '🔴'}
            ${campaign.data.title} ⟶ ${(campaign.data.tls == "y" 
            ? `<a href='https://${campaign.data.domain}' target='_blank'>${campaign.data.domain}</a>` 
            : `<a href='http://${campaign.data.domain}' target='_blank'>${campaign.data.domain}</a>`)} 
          </div>

          <div class="row-icons">
              <button class="icon-button js-show-logs-button" data-logs-button-id="${campaign.id}">📥</button>
              <button class="icon-button js-show-clicks-button" data-clicks-button-id="${campaign.id}">🖱️</button>
              <button class="icon-button js-show-hits-button" data-hits-button-id="${campaign.id}">🎣</button>
              <button class="icon-button">📊</button>
              <button class="icon-button js-delete-campaign-button" data-del-button-id="${campaign.id}">❌</button>
          </div>
      </div>`
  });

  return campaignPreviewGridHTML;

}

// BUTTON EVENT HANDLER AFTER WINDOW LOADS
const handleButtonEvents = () => {

  document.querySelectorAll('.js-delete-campaign-button').forEach((delButton) => {
    delButton.addEventListener('click', async () => {
      if (confirm('This campaigns data will get deleted, are you sure?')) {
        const delButtonUniq = delButton.dataset.delButtonId;
        await deleteCampaign(delButtonUniq);
        await fetchCampaigns();
        renderOpenCampaignWindowHTML();
      }
    });
  });

  document.querySelectorAll('.js-show-logs-button').forEach((logButton) => {

    logButton.addEventListener('click', async () => {
      const campaignId = logButton.dataset.logsButtonId;
      await fetchCampaigns();
      renderLogsViewHTML(campaignId);
    });


  });

  document.querySelectorAll('.js-show-hits-button').forEach((hitButton) => {

    hitButton.addEventListener('click', async () => {
      const campaignId = hitButton.dataset.hitsButtonId;
      console.log(campaignId, 'We pass this to backend to do updateCampaign magic and we fetch + rerender again');
      await updateHits(campaignId);
      await fetchCampaigns();
      renderHitsViewHTML(campaignId);
    });


  });

  document.querySelectorAll('.js-show-clicks-button').forEach((clickButton) => {

    clickButton.addEventListener('click', async () => {
      const campaignId = clickButton.dataset.clicksButtonId;
      await fetchCampaigns();
      renderClicksViewHTML(campaignId);
    });


  });
}

// FORM VIEW HTML RENDER
const renderFormPromptHTML = () => {
  const html = `
              <form id="create-campaign-form" class="campaign-form">
    
    <label for="title">Enter your campaign title:</label>
    <input type="text" id="title" name="title" placeholder="Campaign Title" autocomplete="off" required>

    <label for="bait">Choose your bait - (o365, owa2019, warning):</label>
    
    <select name="bait" id="bait" required>
        <option value="o365">Office 365 login</option>
        <option value="owa2019">Outlook login</option>
        <option value="warning">Warning</option>
    </select>

    <label for="domain">Enter domain (or IPv4) for your campaign:</label>
    <input type="text" id="domain" name="domain" placeholder="example.com or 192.168.1.1" autocomplete="off" required>

    <label for="redirect">Enter domain you want to redirect to:</label>
    <input type="text" id="redirect" name="redirect" placeholder="redirect-domain.com" autocomplete="off" required>

    <label for="tls">Do you want to setup a TLS?</label>
    <select name="tls" id="tls" required>
        <option value="y">Yes</option>
        <option value="n">No</option>
    </select>

    <button type="submit" class="submit-btn">Start Campaign</button>
</form>`
  document.querySelector('.js-window-content').innerHTML = html;
  document.querySelector('#create-campaign-form').addEventListener('submit', async (e) => {
    await createCampaign(e);
    await fetchCampaigns();
    renderOpenCampaignWindowHTML();
  });
}

// HITS VIEW HTML RENDER
const renderHitsViewHTML = (campaignId) => {

  let matchingCampaign;

  campaigns.forEach((campaign) => {

    if (campaign.id == campaignId) {
      matchingCampaign = campaign;
    }

  });

  const hitsViewHTML = `
  <div class="hits-view">
    <p>${JSON.stringify(matchingCampaign.data.hits.slice().reverse(), null, 4)}</p>
  </div>`;
  
  document.querySelector('.js-window-content').innerHTML = hitsViewHTML;
  
  document.querySelector('.js-nav-refresh').addEventListener('click', async () => {
    console.log(campaignId, 'we refreshed sucesfully');
    await updateHits(campaignId);
    await fetchCampaigns();
    renderHitsViewHTML(campaignId);
  })
}


// CLICKS VIEW HTML RENDER
const renderClicksViewHTML = (campaignId) => {

  let matchingCampaign;

  campaigns.forEach((campaign) => {

    if (campaign.id == campaignId) {
      matchingCampaign = campaign;
    }

  });

  const clicksViewHTML = `
  <div class="clicks-view">
    <p>${JSON.stringify(matchingCampaign.data.clicks.slice().reverse(), null, 4)}</p>
  </div>`;
  
  document.querySelector('.js-window-content').innerHTML = clicksViewHTML;
  
  document.querySelector('.js-nav-refresh').addEventListener('click', async () => {
    console.log(campaignId, 'we refreshed sucesfully');
    await fetchCampaigns();
    renderClicksViewHTML(campaignId);
  })
}

// LOGS VIEW HTML RENDER
export const renderLogsViewHTML = (campaignId) => {

  let matchingCampaign;

  campaigns.forEach((campaign) => {

    if (campaign.id == campaignId) {
      matchingCampaign = campaign;
    }

  });

  const logsViewHTML = `
  <div class="hits-view">
    <p>${JSON.stringify(matchingCampaign.data.logs.slice().reverse(), null, 4)}</p>
  </div>`;
  
  document.querySelector('.js-window-content').innerHTML = logsViewHTML;
  
  document.querySelector('.js-nav-refresh').addEventListener('click', async () => {
    await fetchCampaigns();
    renderLogsViewHTML(campaignId);
  })
}

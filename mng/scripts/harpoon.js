import { closeWindow } from "./utils/windowing.js";
import { deleteEmailTemplate, emailTemplates, fetchEmailTemplates } from "./data/harpoonData.js";
import { createEmailTemplate, sendEmail } from "./form.js";
import { campaigns, fetchCampaigns } from "./data/campaignsData.js";
import { renderLogsViewHTML, renderOpenCampaignWindowHTML } from "./campaign.js";


// INITIAL FIRST CLICK ON HARPOON MODULE ICON
document.querySelector('.js-harpoon-icon').addEventListener('click', async () => {

  await fetchEmailTemplates();
  renderOpenHarpoonWindowHTML();

});

// WINDOW PLACEHOLDER HTML RENDER
export const renderOpenHarpoonWindowHTML = () => {
  let openHarpoonWindowHtml = `      <div class="window">
        <div class="window-header">
            <div class="nav-buttons">
                <button class="nav-back js-nav-back">←</button>
                <button class="nav-forward">→</button>
                <button class="nav-refresh js-nav-refresh">↻</button>
            </div>
            <div class="window-title">Email Templates</div>
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
              ${renderEmailTemplatePreviewGridHTML()}
        </div>
      </div>
      `

  document.querySelector('.js-window-wrapper').innerHTML = openHarpoonWindowHtml;
  document.querySelector('.js-window-close').addEventListener('click', closeWindow);
  document.querySelector('.js-nav-back').addEventListener('click', renderOpenHarpoonWindowHTML);
  document.querySelector('.js-plus-icon').addEventListener('click', renderFormPromptHTML);
  document.querySelector('.js-nav-refresh').addEventListener('click', async () => {
    await fetchEmailTemplates();
    renderOpenHarpoonWindowHTML();
  });

  handleButtonEvents();
}


// BUTTON EVENT HANDLER AFTER WINDOW LOADS
const handleButtonEvents = () => {

  document.querySelectorAll('.js-delete-email-template-button').forEach((delButton) => {
    delButton.addEventListener('click', async () => {
      const delButtonUniq = delButton.dataset.delButtonId;
      await deleteEmailTemplate(delButtonUniq);
      await fetchEmailTemplates();
      renderOpenHarpoonWindowHTML();
    });
  });

  document.querySelectorAll('.js-preview-email-template-button').forEach((previewButton) => {
    previewButton.addEventListener('click', async () => {
      const previewButtonUniq = previewButton.dataset.previewButtonId;
      await renderEmailTemplatePreview(previewButtonUniq);
    });
  });

  document.querySelectorAll('.js-send-email').forEach((sendButton) => {

    sendButton.addEventListener('click', async () => {
      const templateTitle = sendButton.dataset.sendEmailTemplate;
      await fetchCampaigns();
      renderSendEmailForm(templateTitle);
      // Use this inside form itself, at the end of form, when submit is hit, render logs preview of specific campaignId(one we just sent)
      // await sendEmail();
      // renderEmailJobLogs(campaignId);
    });


  });

}

// EMAIL TEMPLATE VIEW INSIDE WINDOW HTML RENDER
const renderEmailTemplatePreviewGridHTML = () => {
  let emailTemplatePreviewGridHTML = ``;

  emailTemplates.forEach((template) => {

    emailTemplatePreviewGridHTML += `
      <div class="content-row">
          <div class="row-title">
            ${template.title}
          </div>

          <div class="row-icons">
            <button class="icon-button js-send-email" data-send-email-template="${template.title}">📤</button>
            <button class="icon-button js-preview-email-template-button" data-preview-button-id="${template.id}">🔎</button>
            <button class="icon-button js-delete-email-template-button" data-del-button-id="${template.title}">❌</button>
          </div>
      </div>`
  });

  return emailTemplatePreviewGridHTML;

}


// EMAIL TEMPLATE FORM VIEW HTML RENDER
const renderFormPromptHTML = () => {
  const html = ` 
    <style>.js-window-content{flex-direction:row;}</style>
    <form id="create-campaign-form" class="template-form">
    
      <label for="title">Enter your email template title:</label>
      <input type="text" id="title" name="title" placeholder="name.html / name.txt" autocomplete="off" required>

      <select name="isHtml" id="isHtml" required>
        <option value="true">Html</option>
        <option value="false">Plain</option>
      </select>

      <label for="content">Edit your template here</label>
      <textarea id="content" name="content" placeholder="..." autocomplete="off" required></textarea>

      <button type="submit" class="submit-btn">Create Template</button>
    </form>

    <iframe id="preview-frame" class="preview-container"></iframe>
  `

  document.querySelector('.js-window-content').innerHTML = html;
  document.querySelector('#create-campaign-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    await createEmailTemplate(e);
    await fetchEmailTemplates();
    renderOpenHarpoonWindowHTML();
  });

  document.querySelector("#content").addEventListener("input", function () {
    const previewFrame = document.querySelector("#preview-frame");
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

  // Get the selected value from the dropdown (HTML or Plain)
  const isHtml = document.querySelector("#isHtml").value === 'true';

  // Get the content from the textarea
  const content = this.value;

  // Clear the iframe content
  previewDoc.open();

  // If the content is HTML, render it as HTML
  if (isHtml) {
    previewDoc.write("<!DOCTYPE html>");
    previewDoc.write("<style>body{color:#ffffff}</style>")
    previewDoc.write(content);
    previewDoc.close();
  }

  // If the content is plain text, render it as plain text
  else {
    // Escape HTML characters to prevent rendering
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Wrap the content in a <pre> tag to preserve whitespace and formatting
    previewDoc.write("<!DOCTYPE html>");
    previewDoc.write(`
      <style>
        pre {
        color: #ffffff;
        }
      </style>
      <pre>${escapedContent}</pre>
      `);
  previewDoc.close();
  }
  });
}

const renderEmailTemplatePreview = (previewButtonUniq) => { 
  
  let matchingEmailTemplate;

  emailTemplates.forEach((template) => {

    if (template.id == previewButtonUniq) {
      matchingEmailTemplate = template;
    }

  });

  const templateViewHTML = (matchingEmailTemplate.isHtml === true) ? `${matchingEmailTemplate.content}` : `<style>pre{color:#000000;font-size:14px;}</style><pre>${matchingEmailTemplate.content}</pre>`
  
  document.querySelector('.js-window-content').innerHTML = templateViewHTML;
  
  document.querySelector('.js-nav-refresh').addEventListener('click', async () => {
    renderEmailTemplatePreview(previewButtonUniq);
  })
};

const renderSendEmailForm = (templateTitle) => {
  const html = `
              <form id="send-email-form" class="campaign-form">
    
    <label for="smtpuser">SMTP Credentials:</label>
    <input type="text" id="smtpuser" name="smtpuser" placeholder="smtpuser@mail.tld" autocomplete="off" required>

    <input type="password" id="smtppass" name="smtppass" placeholder="Password" autocomplete="off" required>

    <select name="smtphost" id="smtphost" required>
      <option value="smtp.mail.me.com">iCloud</option>
      <option value="smtp.gmail.com">Gmail</option>
    </select>

    <input value="${templateTitle}" style="display:none;" type="text" id="emailTemplateTitle" name="emailTemplateTitle" placeholder="SMTP Host" autocomplete="off" required>

    <label for="bait">Choose campaign you wish to send</label>
    
    <select name="campaignId" id="campaignId" required>
        ${extractCampaignIds()}
    </select>

    <label for="subject">Email subject:</label>
    <input type="text" id="subject" name="subject" placeholder="Get creative" autocomplete="off" required>

    <label for="smtpspoof">From: (spoof)</label>
    <input type="text" id="smtpspoof" name="smtpspoof" placeholder="John Doe johndoe@mail.me" autocomplete="off" required>

    <label for="contacts">Contact list</label>
    <textarea id="contacts" name="contacts" placeholder="Name name@mail.com" autocomplete="off" required></textarea>

    <button type="submit" class="submit-btn">Start sending emails</button>
</form>`

  document.querySelector('.js-window-content').innerHTML = html;
  document.querySelector('#send-email-form').addEventListener('submit', async (e) => {
    await sendEmail(e);
    renderOpenCampaignWindowHTML();
  });
}

const extractCampaignIds = () => {
  let html = ``;

  campaigns.forEach((campaign) => {
    html += `<option value="${campaign.id}">${campaign.data.title}</option>`
  })

  return html;
}

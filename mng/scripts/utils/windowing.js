import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

export const closeWindow = () => {
  document.querySelector('.js-window-wrapper').innerHTML = '';
}

export function updateTime() {
  document.addEventListener('DOMContentLoaded', () => {
    // Update time in top bar
    const updateTime = () => {
      document.getElementById('top-bar').textContent =
        dayjs().format('MMM D h:mm A');
    };
    updateTime();
    setInterval(updateTime, 60000);
  });
}
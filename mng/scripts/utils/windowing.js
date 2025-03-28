import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1.11.13/+esm';

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
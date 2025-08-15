import http from '.././helpers/http.js';

document.addEventListener('DOMContentLoaded', async function () {
  let currView = 'server';

  function showView(viewName) {
    const views = ['server', 'login', 'dashboard'];
    if (!views.includes(viewName)) {
      console.warn(`Invalid view name: ${viewName}`);
      return;
    }

    views.forEach(view => {
      const element = document.getElementById(`${view}View`);
      if (view === viewName) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });

    currView = viewName;
  }
});

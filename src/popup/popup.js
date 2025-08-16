import http from '.././helpers/http.js';
import storage from '.././helpers/storage.js';
import { view, ui } from '.././helpers/ui.js';

document.addEventListener('DOMContentLoaded', async function () {
  const storedUrl = await storage.get('serverUrl');
  if (storedUrl) {
    http.setBaseURL(storedUrl);
    document.getElementById('currentServerUrl').innerHTML = `Current server is ${storedUrl}`;
    view.show('login');
  }

  document
    .getElementById('testConnectionBtn')
    .addEventListener('click', async function () {
      ui.toggleLoading(this);

      const url = document.getElementById('serverUrl').value;

      if (url == "") {
        ui.showError('You must provide Server URL to continue.', 'serverError');
        ui.toggleLoading(this);
        return;
      }

      storage.set('serverUrl', url);

      http.setBaseURL(url);
      const res = await http.get('/ping');

      if (res.status == 'ok') { 
        ui.hideError('serverError');
        ui.clearInput('serverUrl');
        ui.toggleLoading(this);
        view.show('login');
      }
    });

  const a = document
    .getElementById('backToServerBtn')
    .addEventListener('click', async () => {
      await storage.remove('serverUrl');
      view.show('server')
    });
});

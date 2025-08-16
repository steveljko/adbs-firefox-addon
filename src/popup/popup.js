import http from '.././helpers/http.js';
import {
  ping
} from '.././helpers/api.js';
import storage from '.././helpers/storage.js';
import { view, ui } from '.././helpers/ui.js';

document.addEventListener('DOMContentLoaded', async function () {
  const storedUrl = await storage.get('serverUrl');
  if (storedUrl) {
    http.setBaseURL(storedUrl);
    ui.setText('currentServerUrl', `Current server is ${storedUrl}`);
    view.show('login');
  }

  document
    .getElementById('testConnectionBtn')
    .addEventListener('click', async function () {
      ui.toggleLoading(this);

      const url = document.getElementById('serverUrl').value;

      if (url == "") {
        ui.showError('serverError', 'You must provide Server URL to continue.',);
        ui.toggleLoading(this);
        return;
      }

      http.setBaseURL(url);
      try {
        const res = await ping();

        if (res.status == 'ok') { 
          storage.set('serverUrl', url);
          ui.setText('currentServerUrl', `Current server is ${url}`);

          ui.hideError('serverError');
          ui.clearInput('serverUrl');
          ui.toggleLoading(this);
          view.show('login');
        }
      } catch (err) {
        ui.showError('serverError', 'Wrong URL provided, please check and submit again.');
        ui.toggleLoading(this);
        return;
      }
    });

  document
    .getElementById('backToServerBtn')
    .addEventListener('click', async () => {
      await storage.remove('serverUrl');
      view.show('server')
    });
});

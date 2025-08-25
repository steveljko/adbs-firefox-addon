import http from '.././helpers/http.js';
import {
  ping,
  login,
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

  const storedToken = await storage.get('token');
  if (storedUrl && storedToken) {
    view.show('dashboard');
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

  document
    .getElementById('loginView')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      ui.toggleLoading(e.submitter);

      try {
        const res = await login({ email, password });

        if (res.status == "success") {
          storage.set('token', res.token);
          view.show('dashboard');
        }
      } catch (err) {
        const { email: emailError, password: passwordError } = err.messages;

        ui.setInputError('email', emailError);
        ui.setInputError('password', passwordError);
        ui.toggleLoading(e.submitter);
      }
    });
});

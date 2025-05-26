document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    document.getElementById('serverConfig').classList.add('hidden');
    document.getElementById('checkAcception').classList.toggle('hidden');
  }

  async function checkConnection(url) {
    try {
      const res = await fetch(`${url}/api/ping`);

      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
      }

      const json = await res.json();
      if (json.status == "ok") {
        document.getElementById('serverConfig').classList.add('hidden');
        document.getElementById('loginForm').classList.toggle('hidden');
      }
    } catch (error) {
      console.error(error.message);
      return 'null'
    }
  }
  document
    .getElementById('saveServerBtn')
    .addEventListener('click', async function () {
      const inputUrl = document.getElementById('url').value;
      const formattedUrl = inputUrl.startsWith('http') ? inputUrl : `http://${inputUrl}`;

      await checkConnection(formattedUrl);
    });

  document
    .getElementById('loginBtn')
    .addEventListener('click', async function () {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          "X-Addon-Version": "0.0.0",
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${error}`);
      }

      const { status, token } = await response.json();
      if (status == "ok") {
        localStorage.setItem('token', token);

        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('checkAcception').classList.toggle('hidden');
      }
    });

  document.getElementById('remove').addEventListener('click', _ => localStorage.removeItem('token'));
});

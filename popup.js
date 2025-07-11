document.addEventListener('DOMContentLoaded', async () => {
  const api = new ApiClient;
  const storage = new StorageManager;
  let currentView = 'server';
  let serverUrl = '';
  let isLoading = false;

  await api.initialize();

  async function loadStoredData() {
    try {
      const storedServerUrl = await api.storage.get('serverUrl');

      if (storedServerUrl) {
        serverUrl = storedServerUrl;
        document.getElementById('serverUrl').value = storedServerUrl;
        api.setBaseURL(storedServerUrl);
      }
    } catch (e) {
      console.error('Error loading stored data:', e);
    }
  }

  function showView(viewName) {
    const views = ['server', 'login', 'dashboard'];
    views.forEach(view => {
      const element = document.getElementById(`${view}View`);
      if (view === viewName) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
    currentView = viewName;
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.remove('show');
  }

  function setLoading(buttonId, spinnerId, textId, isLoading, loadingText, normalText) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(spinnerId);
    const text = document.getElementById(textId);

    button.disabled = isLoading;
    spinner.classList.toggle('hidden', !isLoading);
    text.textContent = isLoading ? loadingText : normalText;
  }

  async function updateUserInfo() {
    const userInfoElement = document.getElementById('user-info');
    const userName = await storage.get('user_name')

    if (userName) {
      userInfoElement.textContent = `Logged in as ${userName}`;
    }
  }

  // API functions
  async function testConnection() {
    const serverUrlInput = document.getElementById('serverUrl').value;

    if (!serverUrlInput) {
      showError('serverError', 'Please enter a server URL');
      return;
    }

    hideError('serverError');
    setLoading('testConnectionBtn', 'serverSpinner', 'serverBtnText', true, 'Testing Connection...', 'Test Connection');

    try {
      const formattedUrl = formatUrl(serverUrlInput);
      api.setBaseURL(formattedUrl);

      const response = await api.ping();

      if (response && response.status === 'ok') {
        serverUrl = formattedUrl;
        await api.storage.set('serverUrl', formattedUrl);
        showView('login');
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      if (error.name === 'TypeError' || error.message.includes('Network error')) {
        showError('serverError', 'Unable to connect to server. Please check your URL and try again.');
      } else {
        showError('serverError', `Connection failed: ${error.message}`);
      }
    } finally {
      setLoading('testConnectionBtn', 'serverSpinner', 'serverBtnText', false, 'Testing Connection...', 'Test Connection');
    }
  }

  async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('loginError', 'Please enter both email and password');
      return;
    }

    hideError('loginError');
    setLoading('loginBtn', 'loginSpinner', 'loginBtnText', true, 'Signing In...', 'Sign In');

    try {
      const response = await api.login(email, password);

      if (response && response.status === 'success') {
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';

        showView('dashboard');
        updateUserInfo();
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials and try again.';

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      showError('loginError', errorMessage);
    } finally {
      setLoading('loginBtn', 'loginSpinner', 'loginBtnText', false, 'Signing In...', 'Sign In');
    }
  }

  async function logout() {
    try {
      await api.logout();

      document.getElementById('email').value = '';
      document.getElementById('password').value = '';

      hideError('serverError');
      hideError('loginError');

      showView('server');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Event listeners
  function bindEvents() {
    // Server configuration
    document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
    document.getElementById('serverUrl').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') testConnection();
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('email').addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
    document.getElementById('password').addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
    document.getElementById('backToServerBtn').addEventListener('click', () => showView('server'));

    // Dashboard
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }

  async function init() {
    await loadStoredData();
    bindEvents();

    if (api.token) {
      showView('dashboard');
      updateUserInfo();
    }
  }

  await init();
});

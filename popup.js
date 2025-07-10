class Popup {
  constructor() {
    this.currentView = 'server';
    this.serverUrl = '';
    this.user_name = null;
    this.token = null;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.loadStoredData();
    this.bindEvents();

    if (this.token) {
      this.showView('dashboard');
      this.updateUserInfo();
    }
  }

  bindEvents() {
    // Server configuration
    document.getElementById('testConnectionBtn').addEventListener('click', () => this.testConnection());
    document.getElementById('serverUrl').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.testConnection();
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', () => this.login());
    document.getElementById('email').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.login();
    });
    document.getElementById('password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.login();
    });
    document.getElementById('backToServerBtn').addEventListener('click', () => this.showView('server'));

    // Dashboard
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
  }

  loadStoredData() {
    try {
      this.token = this.getStorageItem('token');
      this.user_name = this.getStorageItem('user_name');
      const storedServerUrl = this.getStorageItem('serverUrl');

      if (storedServerUrl) {
        this.serverUrl = storedServerUrl;
        document.getElementById('serverUrl').value = storedServerUrl;
      }
    } catch (e) {
      console.error('Error loading stored data:', e);
    }
  }

  getStorageItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return this[`_${key}`];
    }
  }

  setStorageItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      this[`_${key}`] = value;
    }
  }

  removeStorageItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      delete this[`_${key}`];
    }
  }

  formatUrl(url) {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  }

  showView(viewName) {
    const views = ['server', 'login', 'dashboard'];
    views.forEach(view => {
      const element = document.getElementById(`${view}View`);
      if (view === viewName) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
    this.currentView = viewName;
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.remove('show');
  }

  setLoading(buttonId, spinnerId, textId, isLoading, loadingText, normalText) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(spinnerId);
    const text = document.getElementById(textId);

    button.disabled = isLoading;
    spinner.classList.toggle('hidden', !isLoading);
    text.textContent = isLoading ? loadingText : normalText;
  }

  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Addon-Version': '1.0.0'
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async testConnection() {
    const serverUrl = document.getElementById('serverUrl').value;

    if (!serverUrl) {
      this.showError('serverError', 'Please enter a server URL');
      return;
    }

    this.hideError('serverError');
    this.setLoading('testConnectionBtn', 'serverSpinner', 'serverBtnText', true, 'Testing Connection...', 'Test Connection');

    try {
      const formattedUrl = this.formatUrl(serverUrl);
      const response = await this.makeRequest(`${formattedUrl}/api/ping`);

      if (response && response.status === 'ok') {
        this.serverUrl = formattedUrl;
        this.setStorageItem('serverUrl', formattedUrl);
        this.showView('login');
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        this.showError('serverError', 'Unable to connect to server. Please check your URL and try again.');
      } else {
        this.showError('serverError', `Connection failed.`);
      }
    } finally {
      this.setLoading('testConnectionBtn', 'serverSpinner', 'serverBtnText', false, 'Testing Connection...', 'Test Connection');
    }
  }

  async login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showError('loginError', 'Please enter both email and password');
      return;
    }

    this.hideError('loginError');
    this.setLoading('loginBtn', 'loginSpinner', 'loginBtnText', true, 'Signing In...', 'Sign In');

    try {
      const serverUrl = this.getStorageItem('serverUrl');
      const response = await this.makeRequest(`${serverUrl}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response && response.status === 'success') {
        this.token = response.token;
        this.user_name = response.user_name;

        this.setStorageItem('token', this.token);
        this.setStorageItem('user_name', this.user_name);

        document.getElementById('email').value = '';
        document.getElementById('password').value = '';

        this.showView('dashboard');
        this.updateUserInfo();
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      this.showError('loginError', 'Login failed. Please check your credentials and try again.');
    } finally {
      this.setLoading('loginBtn', 'loginSpinner', 'loginBtnText', false, 'Signing In...', 'Sign In');
    }
  }

  updateUserInfo() {
    const userInfoElement = document.getElementById('user-info');
    console.log(this.user_name);

    if (this.user_name) {
      userInfoElement.textContent = `Logged in as ${this.user_name}`;
    }  

  }

  logout() {
    this.token = null;
    this.user = null;

    this.removeStorageItem('token');
    this.removeStorageItem('user');

    document.getElementById('email').value = '';
    document.getElementById('password').value = '';

    this.hideError('serverError');
    this.hideError('loginError');

    this.showView('server');
  }
}

document.addEventListener('DOMContentLoaded', () => new Popup);

class ApiClient {
  constructor() {
    this.baseURL = null;
    this.token = null;
    this.version = '1.0.0';
    this.storage = new StorageManager();
  }

  async initialize() {
    try {
      this.baseURL = await this.storage.get('serverUrl');
      this.token = await this.storage.get('token');
    } catch (error) {
      console.error('Failed to initialize API client:', error);
    }
  }

  setBaseURL(url) {
    this.baseURL = this.formatUrl(url);
  }

  setToken(token) {
    this.token = token;
  }

  formatUrl(url) {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Addon-Version': this.version
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.baseURL) {
      throw new Error('Base URL not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: this.getHeaders(options.includeAuth !== false)
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, mergedOptions);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new ApiError(errorMessage, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(error.message || 'Unknown error occurred', 0);
    }
  }

  // ---------------//
  //  API Methods   //
  // ---------------//
  async ping() {
    const URL = '/api/ping';
    return this.makeRequest(URL, { includeAuth: false });
  }

  async login(email, password) {
    const URL = '/api/login';

    const response = await this.makeRequest(URL, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      includeAuth: false
    });

    if (response.status === 'success') {
      this.token = response.token;
      await this.storage.set('token', this.token);
      await this.storage.set('user_name', response.user_name);
    }

    return response;
  }

  async createBookmark(bookmarkData) {
    const URL = '/api/bookmark';
    return this.makeRequest(URL, {
      method: 'POST',
      body: JSON.stringify(bookmarkData)
    });
  }

  async logout() {
    this.token = null;
    await this.storage.remove('token');
    await this.storage.remove('user_name');
  }
}

class HttpClient {
  constructor() {
    this.baseURL = null;
    this.token = null;
    this.version = '1.0.0';
  }
  
  setBaseURL(url) {
    this.baseURL = this.formatUrl(url);
  }
  
  setToken(token) {
    this.token = token;
  }
  
  formatUrl(url) {
    const hasHttp = url.startsWith('http');

    if (!hasHttp) return `http://${url}`;

    return url;
  }
  
  getHeaders(includeAuth = true) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Addon-Version': this.version
    };
    if (includeAuth && this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }
  
  async makeRequest(endpoint, options = {}) {
    if (!this.baseURL) {
      throw new Error('Base URL not configured');
    }
    
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = { headers: this.getHeaders(options.includeAuth !== false) };
    
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
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: 'GET'
    });
  }
  
  async post(endpoint, data = null, options = {}) {
    const postOptions = {
      ...options,
      method: 'POST'
    };
    
    if (data) postOptions.body = JSON.stringify(data);
    
    return this.makeRequest(endpoint, postOptions);
  }
  
  async put(endpoint, data = null, options = {}) {
    const putOptions = {
      ...options,
      method: 'PUT'
    };
    
    if (data) putOptions.body = JSON.stringify(data);
    
    return this.makeRequest(endpoint, putOptions);
  }
}

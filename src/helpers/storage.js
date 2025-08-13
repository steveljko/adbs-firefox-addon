class StorageManager {
  constructor() {
    this.cache = new Map();
    this.isExtensionContext = typeof browser !== 'undefined' && browser.storage;
  }

  async get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    let value = null;
    
    try {
      if (this.isExtensionContext) {
        const result = await browser.storage.local.get(key);
        value = result[key];
      } else {
        value = localStorage.getItem(key);
      }
      
      if (value !== null) {
        this.cache.set(key, value);
      }
    } catch (error) {
      console.warn(`Storage get failed for key ${key}:`, error);
    }

    return value;
  }

  async set(key, value) {
    try {
      if (this.isExtensionContext) {
        await browser.storage.local.set({ [key]: value });
      } else {
        localStorage.setItem(key, value);
      }
      
      this.cache.set(key, value);
    } catch (error) {
      console.error(`Storage set failed for key ${key}:`, error);
      throw error;
    }
  }

  async remove(key) {
    try {
      if (this.isExtensionContext) {
        await browser.storage.local.remove(key);
      } else {
        localStorage.removeItem(key);
      }
      
      this.cache.delete(key);
    } catch (error) {
      console.error(`Storage remove failed for key ${key}:`, error);
      throw error;
    }
  }

  async getMultiple(keys) {
    const results = {};
    
    try {
      if (this.isExtensionContext) {
        const result = await browser.storage.local.get(keys);
        Object.assign(results, result);
      } else {
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value !== null) {
            results[key] = value;
          }
        });
      }
      
      Object.entries(results).forEach(([key, value]) => {
        this.cache.set(key, value);
      });
    } catch (error) {
      console.error('Storage getMultiple failed:', error);
    }

    return results;
  }

  async setMultiple(items) {
    try {
      if (this.isExtensionContext) {
        await browser.storage.local.set(items);
      } else {
        Object.entries(items).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }
      
      Object.entries(items).forEach(([key, value]) => {
        this.cache.set(key, value);
      });
    } catch (error) {
      console.error('Storage setMultiple failed:', error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

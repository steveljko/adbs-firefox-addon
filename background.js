(async () => {
  const api = new ApiClient();
  await api.initialize();

  browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
    try {
      const bookmarkData = {
        title: bookmark.title || '',
        url: bookmark.url
      };

      const result = await api.createBookmark(bookmarkData);
      console.log('Bookmark synced successfully:', result);
      
    } catch (error) {
      console.error('Failed to sync bookmark:', error);
      
      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          console.log('Authentication failed, clearing stored token');
          await api.storage.remove('token');
        }
        console.error('API Error:', error.message);
      } else {
        console.error('Network or other error:', error.message);
      }
      
      // remove bookmark from browser if sync failed
      try {
        await browser.bookmarks.remove(id);
        console.log('Bookmark removed from browser due to sync failure');
      } catch (error) {
        console.error('Failed to remove bookmark after sync failure:', error);
      }
    }
  });
})();

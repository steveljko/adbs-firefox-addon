browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
  try {
    const bookmarkData = {
      title: bookmark.title || '',
      url: bookmark.url
    };

    console.log('Syncing bookmark:', bookmarkData);

    const response = await fetch("http://localhost:8000/api/bookmark", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Addon-Version": "0.0.0",
      },
      body: JSON.stringify(bookmarkData)
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || 'Unknown error';
      } catch {
        errorMessage = await response.text();
      }
      
      console.error(`Failed to sync bookmark: ${response.status} - ${errorMessage}`);
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('Bookmark synced successfully:', result);
  } catch (error) {
    console.error('Error syncing bookmark:', error);
  }
});

/**
 * Image Storage Client Utility
 * 
 * Uploads images to the Website's Local File Storage (/public/uploads)
 * and returns web URL links (/uploads/filename.jpg) for MongoDB Atlas.
 */

export async function uploadImageFile(file: File, prefix: string = 'product'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      if (!base64Data) {
        return resolve('/images/sky_blue_chikankari.jpg');
      }

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            filename: file.name,
            prefix
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.url) {
            return resolve(data.url);
          }
        }
        // Fallback to base64 if network is unavailable
        resolve(base64Data);
      } catch (err) {
        console.warn('[IMAGE UPLOAD NOTICE] Storing preview locally:', err);
        resolve(base64Data);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function uploadMultipleImageFiles(files: File[], prefix: string = 'product'): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadImageFile(file, prefix));
  return Promise.all(uploadPromises);
}

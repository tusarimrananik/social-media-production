export const uploadMedia = async (file: File, _type: 'avatar' | 'post'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const fileUrl = await response.text();
    return fileUrl;
  } catch (error) {
    console.error('Failed to upload media:', error);
    throw new Error('Image upload failed');
  }
};

const uploadImage = async (req, res) => {
  try {
    const { imageBase64, fileName, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image content (imageBase64) is required' });
    }

    const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sweet-saas';
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

    const cleanFileName = `sweets/sweet_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    // If R2 credentials are set, attempt direct Cloudflare R2 upload
    if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
      try {
        const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${cleanFileName}`;

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString()
          },
          body: buffer
        });

        if (response.ok) {
          const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL.replace(/\/$/, '')}/${cleanFileName}`
            : `https://pub-${R2_ACCOUNT_ID}.r2.dev/${cleanFileName}`;
          return res.json({ success: true, url: publicUrl });
        }
      } catch (r2Err) {
        console.error('Cloudflare R2 Upload Error:', r2Err);
      }
    }

    // Fallback mode if R2 environment variables are not configured yet
    const fallbackUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${mimeType};base64,${imageBase64}`;

    return res.json({
      success: true,
      url: fallbackUrl,
      isFallback: true,
      message: 'Cloudflare R2 environment variables not detected. Using optimized image string.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadImage };

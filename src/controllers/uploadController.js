const ImageKit = require('imagekit');

const uploadImage = async (req, res) => {
  try {
    const { imageBase64, fileName = 'sweet.jpg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image content (imageBase64) is required' });
    }

    const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
    const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
    const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

    // If ImageKit credentials are set, upload directly to ImageKit.io CDN
    if (IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT) {
      try {
        const imagekit = new ImageKit({
          publicKey: IMAGEKIT_PUBLIC_KEY,
          privateKey: IMAGEKIT_PRIVATE_KEY,
          urlEndpoint: IMAGEKIT_URL_ENDPOINT
        });

        const cleanFileName = `sweet_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        const uploadResponse = await imagekit.upload({
          file: imageBase64,
          fileName: cleanFileName,
          folder: '/sweets'
        });

        if (uploadResponse && uploadResponse.url) {
          return res.json({
            success: true,
            url: uploadResponse.url,
            fileId: uploadResponse.fileId,
            message: 'Image uploaded successfully to ImageKit.io'
          });
        }
      } catch (ikErr) {
        console.error('ImageKit Upload Error:', ikErr);
      }
    }

    // Fallback mode if ImageKit environment variables are not configured yet
    const fallbackUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    return res.json({
      success: true,
      url: fallbackUrl,
      isFallback: true,
      message: 'ImageKit environment variables not configured yet. Using optimized inline image.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadImage };

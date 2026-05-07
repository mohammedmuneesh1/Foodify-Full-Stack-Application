import sharp from "sharp";

interface CompressOptions {
  quality?: number;
  format?:"jpeg" | "png" | "webp" | "tiff" | "avif" | "heif" | "gif"| "raw",
  maxWidth?: number;
  maxHeight?: number;
}

const compressImageSharp = async (
  buffer: Buffer,
  options: CompressOptions 
) => {
  try {
      const {
    quality = 80,
    format = 'webp',
    maxWidth = 1920,
    maxHeight = 1920
  } = options;


    return await sharp(buffer)
    //   .resize(options.maxWidth, options.maxHeight, {
    //     fit: 'inside',
    //     withoutEnlargement: true
    //   })
      .toFormat(format, { quality })
      .toBuffer();
//       The Sharp library supports several output formats:
// jpeg, png, webp, tiff, avif, heif, gif, and raw.
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
};
export default compressImageSharp;
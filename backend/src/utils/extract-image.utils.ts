import sharp from 'sharp';

export function extractPublicIdFromUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;

  const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  if (matches?.[1]) {
    logger.info(`Found old image public_id for deletion: ${matches[1]}`);
    return matches[1];
  }
  return undefined;
}

export async function resizeImageToBase64(
  buffer: Buffer,
  width = 800,
  height = 800,
): Promise<string> {
  const resizedBuffer = await sharp(buffer)
    .resize({
      width,
      height,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  return resizedBuffer.toString('base64');
}

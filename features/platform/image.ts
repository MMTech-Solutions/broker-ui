/**
 * Platform images are served by broker-service (never direct S3/MinIO URLs).
 * Truthiness of `imagePath` means an image exists; the browser always loads via BFF.
 */
export function platformImageUrl(
  platformId: string,
  imagePath: string | null | undefined,
): string | null {
  if (!platformId || !imagePath) {
    return null;
  }

  return `/api/broker/v1/public/platforms/${platformId}/image`;
}

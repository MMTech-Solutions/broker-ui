/**
 * IB program images are served by broker-service (never direct S3/MinIO URLs).
 * Truthiness of `imagePath` means an image exists; the browser always loads via BFF.
 */
export function ibProgramImageUrl(
  programId: string,
  imagePath: string | null | undefined,
): string | null {
  if (!programId || !imagePath) {
    return null;
  }

  return `/api/broker/v1/public/ib-programs/${programId}/image`;
}

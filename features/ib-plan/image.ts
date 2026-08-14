/**
 * IB plan images are served by broker-service (never direct S3/MinIO URLs).
 * Truthiness of `imagePath` means an image exists; the browser always loads via BFF.
 */
export function ibPlanImageUrl(
  planId: string,
  imagePath: string | null | undefined,
): string | null {
  if (!planId || !imagePath) {
    return null;
  }

  return `/api/broker/v1/public/ib-plans/${planId}/image`;
}

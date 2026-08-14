/**
 * Contest banners are served by broker-service (never direct S3/MinIO URLs).
 * Truthiness of `bannerUrl` means a banner exists; the browser always loads via BFF.
 */
export const CONTEST_BANNER_IMAGE_PATH =
  "/api/broker/v1/public/contests/banner";

export function contestBannerImageUrl(
  bannerUrl: string | null | undefined,
): string | null {
  if (!bannerUrl) {
    return null;
  }

  return CONTEST_BANNER_IMAGE_PATH;
}

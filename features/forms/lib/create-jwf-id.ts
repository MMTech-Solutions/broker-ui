export function createJwfId(now = Date.now()): string {
  if (!Number.isSafeInteger(now) || now < 0 || now > 0xffffffffffff) {
    throw new RangeError("The UUID v7 timestamp is outside the supported range.");
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const timestampHigh = Math.floor(now / 0x100000000);
  const timestampLow = now >>> 0;

  bytes[0] = (timestampHigh >>> 8) & 0xff;
  bytes[1] = timestampHigh & 0xff;
  bytes[2] = (timestampLow >>> 24) & 0xff;
  bytes[3] = (timestampLow >>> 16) & 0xff;
  bytes[4] = (timestampLow >>> 8) & 0xff;
  bytes[5] = timestampLow & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

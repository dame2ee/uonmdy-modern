/**
 * Generator for staff secret keys.
 *
 * The alphabet leaves out the characters that get misread when a key is read
 * over the phone or copied off a screen: 0, 1, I and O. Its length is 32, so
 * every random byte maps onto exactly one character and the key stays uniform.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const GROUPS = 4;
const GROUP_SIZE = 4;

/**
 * A fresh key in four groups of four, e.g. "K7QF-3MZP-9RTV-X2WD". Uses the
 * platform CSPRNG, so it works in the browser and in Node alike.
 */
export function generateSecretKey(): string {
  const bytes = crypto.getRandomValues(
    new Uint8Array(GROUPS * GROUP_SIZE),
  );
  const chars = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]);
  return chars
    .join("")
    .replace(new RegExp(`(.{${GROUP_SIZE}})(?=.)`, "g"), "$1-");
}

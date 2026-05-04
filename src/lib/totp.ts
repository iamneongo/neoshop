import { createHmac } from "crypto";

const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

function normalizeBase32(secret: string) {
  return secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
}

function base32ToBuffer(secret: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = normalizeBase32(secret);
  let bits = "";

  for (const char of normalized) {
    const value = alphabet.indexOf(char);
    if (value === -1) {
      throw new Error("TOTP secret không hợp lệ.");
    }
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}

export function generateTotp(secret: string, now = Date.now()) {
  const key = base32ToBuffer(secret);
  const counter = Math.floor(now / 1000 / TOTP_PERIOD_SECONDS);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  const code = (binary % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, "0");
  const expiresIn = TOTP_PERIOD_SECONDS - (Math.floor(now / 1000) % TOTP_PERIOD_SECONDS);

  return {
    code,
    expiresIn,
    periodSeconds: TOTP_PERIOD_SECONDS,
  };
}

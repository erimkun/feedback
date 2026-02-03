import { nanoid } from "nanoid";

export function generateId(length?: number) {
  // If caller provided an explicit length, prefer it.
  if (typeof length === "number" && length > 0) {
    return nanoid(length);
  }

  // Otherwise fall back to env-configured length or default.
  const envLength = parseInt(process.env.NANOID_LENGTH || "", 10);
  const finalLength = Number.isFinite(envLength) && envLength > 0 ? envLength : 10;
  return nanoid(finalLength);
}

export default generateId;

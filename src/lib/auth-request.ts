import { NextRequest } from "next/server";
import { verifyJWT } from "./jwt";

/**
 * Get the authenticated userId from a request.
 * Tries x-user-id header first (set by middleware),
 * then falls back to decoding the JWT cookie directly.
 */
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const fromHeader = req.headers.get("x-user-id");
  if (fromHeader) return fromHeader;

  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  return payload?.userId ?? null;
}

export async function getAuthNickname(req: NextRequest): Promise<string | null> {
  const fromHeader = req.headers.get("x-user-nickname");
  if (fromHeader) return decodeURIComponent(fromHeader);

  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  return payload?.nickname ?? null;
}

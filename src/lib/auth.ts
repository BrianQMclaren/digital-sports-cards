import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_EXPIRATION = "7d"; // Token expires in 7 days
const COOKIE_NAME = "auth_token";

// interface JWTPayload {
//   userId: string;
// }

export async function generateJWT(payload: jose.JWTPayload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Error verifying session:", error);
    return null;
  }
}

export async function setAuthCookie(userId: string) {
  try {
    const token = await generateJWT({ userId });

    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return false;
  }
}

export async function getAuthPayload() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    return payload;
  } catch (error) {
    console.error("Error getting payload:", error);
    return null;
  }
}

export async function deleteAuthCookie() {
  const cookiesStore = await cookies();
  cookiesStore.delete(COOKIE_NAME);
}

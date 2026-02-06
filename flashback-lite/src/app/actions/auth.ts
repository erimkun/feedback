"use server";

import { SignJWT } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
const ALG = "HS256";

export async function login(prevState: any, formData: FormData) {
  // Rate limiting - prevent brute force
  const headersList = await headers();
  const clientIP = getClientIP(headersList);

  try {
    await checkRateLimit(clientIP, "LOGIN");
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: ALG })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(SECRET);

    const cookieStore = await cookies();

    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF protection
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    redirect("/admin");
  }

  return { success: false, error: "Geçersiz kullanıcı adı veya şifre" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}

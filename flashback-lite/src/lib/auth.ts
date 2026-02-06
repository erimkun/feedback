"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Auth helper for verifying admin access in server actions
 * This ensures that server actions can only be called by authenticated admins
 */

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    return new TextEncoder().encode(secret);
};

/**
 * Verifies that the current request is from an authenticated admin
 * @throws Error if not authenticated
 */
export async function verifyAdmin(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
        throw new Error("Unauthorized: No admin token found");
    }

    try {
        await jwtVerify(token, getSecret());
    } catch {
        throw new Error("Unauthorized: Invalid or expired token");
    }
}

/**
 * Checks if the current user is an authenticated admin
 * @returns boolean - true if authenticated, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
    try {
        await verifyAdmin();
        return true;
    } catch {
        return false;
    }
}

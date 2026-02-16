"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Auth helper for verifying admin access in server actions
 * This ensures that server actions can only be called by authenticated admins
 */

export type UserRole = "admin" | "viewer";

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    return new TextEncoder().encode(secret);
};

/**
 * Verifies that the current request is from an authenticated user (admin or viewer)
 * @throws Error if not authenticated
 * @returns The user's role
 */
export async function verifyAuth(): Promise<UserRole> {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
        throw new Error("Unauthorized: No admin token found");
    }

    try {
        const { payload } = await jwtVerify(token, getSecret());
        return (payload.role as UserRole) || "viewer";
    } catch {
        throw new Error("Unauthorized: Invalid or expired token");
    }
}

/**
 * Verifies that the current request is from an authenticated admin
 * @throws Error if not authenticated or not admin
 */
export async function verifyAdmin(): Promise<void> {
    const role = await verifyAuth();
    if (role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }
}

/**
 * Gets the current user's role
 * @returns The user role or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
    try {
        return await verifyAuth();
    } catch {
        return null;
    }
}

/**
 * Checks if the current user is an authenticated admin
 * @returns boolean - true if authenticated as admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const role = await verifyAuth();
        return role === "admin";
    } catch {
        return false;
    }
}

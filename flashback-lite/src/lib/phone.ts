/**
 * Phone number validation utilities
 * Can be used on both client and server side
 */

/**
 * Format phone number to Turkish format
 * Accepts: 05XX XXX XX XX, 5XX XXX XX XX, +90 5XX XXX XX XX
 * Returns: 905XXXXXXXXX or null if invalid
 */
export function formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Handle different formats
    if (digits.length === 10 && digits.startsWith("5")) {
        // 5XX XXX XX XX -> 905XXXXXXXXX
        return "90" + digits;
    } else if (digits.length === 11 && digits.startsWith("05")) {
        // 05XX XXX XX XX -> 905XXXXXXXXX
        return "9" + digits;
    } else if (digits.length === 12 && digits.startsWith("90")) {
        // 90 5XX XXX XX XX -> already correct
        return digits;
    } else if (digits.length === 13 && digits.startsWith("090")) {
        // 090 5XX XXX XX XX -> 905XXXXXXXXX
        return digits.substring(1);
    }

    return null;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
    return formatPhoneNumber(phone) !== null;
}

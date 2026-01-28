/**
 * SMS Service - Posta Güvercini API Integration
 * API Docs: https://otpsms.postaguvercini.com
 */

interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface SMSSendPayload {
  username: string;
  password: string;
  sender: string;
  phone: string[];
  message: string;
}

export async function sendSMS(
  phoneNumber: string,
  feedbackLink: string
): Promise<SMSResponse> {
  const username = process.env.SMS_API_USERNAME;
  const password = process.env.SMS_API_PASSWORD;
  const apiUrl = process.env.SMS_API_URL;
  const testMode = process.env.SMS_TEST_MODE === "true";
  const messageTemplate =
    process.env.SMS_MESSAGE_TEMPLATE || "Bizi değerlendirin: {link}";

  if (!username || !password || !apiUrl) {
    return {
      success: false,
      error: "SMS API yapılandırması eksik",
    };
  }

  // Format phone number (remove spaces, ensure starts with country code)
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return {
      success: false,
      error: "Geçersiz telefon numarası",
    };
  }

  // Replace {link} placeholder with actual link
  const message = messageTemplate.replace("{link}", feedbackLink);

  // Test mode - don't actually send SMS
  if (testMode) {
    console.log("[SMS TEST MODE] Would send SMS:");
    console.log("  To:", formattedPhone);
    console.log("  Message:", message);
    return {
      success: true,
      message: "Test modu: SMS simüle edildi",
    };
  }

  try {
    const payload: SMSSendPayload = {
      username,
      password,
      sender: "MSGSERVICE", // Default sender ID
      phone: [formattedPhone],
      message,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check API response (adjust based on actual API response format)
    if (data.status === "success" || data.code === 0 || data.success) {
      return {
        success: true,
        message: "SMS başarıyla gönderildi",
      };
    } else {
      return {
        success: false,
        error: data.message || data.error || "SMS gönderilemedi",
      };
    }
  } catch (error) {
    console.error("SMS sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMS gönderilemedi",
    };
  }
}

/**
 * Format phone number to Turkish format
 * Accepts: 05XX XXX XX XX, 5XX XXX XX XX, +90 5XX XXX XX XX
 * Returns: 905XXXXXXXXX or null if invalid
 */
function formatPhoneNumber(phone: string): string | null {
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

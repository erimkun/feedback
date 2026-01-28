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

  console.log("[SMS Debug] Config check:", {
    hasUsername: !!username,
    hasPassword: !!password,
    hasApiUrl: !!apiUrl,
    testMode,
  });

  if (!username || !password || !apiUrl) {
    console.error("[SMS Error] Missing config:", {
      username: username ? "set" : "MISSING",
      password: password ? "set" : "MISSING",
      apiUrl: apiUrl ? "set" : "MISSING",
    });
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
    const payload = {
      username,
      password,
      sender: "USKUDARBLD", // Sender ID - değiştirilebilir
      receiver: formattedPhone,  // Tek numara için string
      message,
    };

    console.log("[SMS] Sending to:", formattedPhone);
    console.log("[SMS] Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("[SMS] API Response status:", response.status);
    console.log("[SMS] API Response body:", responseText);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${responseText}`,
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        error: `Geçersiz API yanıtı: ${responseText.substring(0, 100)}`,
      };
    }

    // Posta Güvercini API response format check
    // Genellikle: { "status": "success", "message_id": "..." } veya { "error": "..." }
    if (
      data.status === "success" ||
      data.status === "ok" ||
      data.code === 0 ||
      data.code === "0" ||
      data.success === true ||
      data.result === "success" ||
      data.message_id
    ) {
      return {
        success: true,
        message: "SMS başarıyla gönderildi",
      };
    } else {
      const errorMsg = data.message || data.error || data.description || data.error_description || JSON.stringify(data);
      console.error("[SMS] API Error:", errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error) {
    console.error("[SMS] Exception:", error);
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

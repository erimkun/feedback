/**
 * SMS Service - Posta Güvercini API Integration
 * API Docs: https://otpsms.postaguvercini.com
 */

import { formatPhoneNumber, isValidPhoneNumber } from "./phone";

// Re-export for backwards compatibility
export { isValidPhoneNumber };

// Only log non-sensitive info in development
const DEBUG = process.env.NODE_ENV === "development";

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
  feedbackLink: string,
  target_name: string,
  office?: string,
  customTemplate?: string
): Promise<SMSResponse> {
  const username = process.env.SMS_API_USERNAME;
  const password = process.env.SMS_API_PASSWORD;
  const apiUrl = process.env.SMS_API_URL;
  const testMode = process.env.SMS_TEST_MODE === "true";
  const messageTemplate =
    customTemplate || process.env.SMS_MESSAGE_TEMPLATE || "Sayın {name}, Üsküdar Yenileniyor kapsamında{office} almış olduğunuz hizmeti değerlendirmek için lütfen linke tıklayınız. {link}";

  // Safe debug log - no sensitive data
  if (DEBUG) {
    console.log("[SMS Debug] Config status:", {
      hasUsername: !!username,
      hasPassword: !!password,
      hasApiUrl: !!apiUrl,
      testMode,
    });
  }

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

  // Replace placeholders with actual values
  const officeText = office ? ` ${office} ofisinden` : "";
  const message = messageTemplate
    .replace("{name}", target_name)
    .replace("{office}", officeText)
    .replace("{link}", feedbackLink);

  // Test mode - don't actually send SMS
  if (testMode) {
    if (DEBUG) {
      console.log("[SMS TEST MODE] Simulating SMS to:", formattedPhone.slice(0, 4) + "****");
    }
    return {
      success: true,
      message: "Test modu: SMS simüle edildi",
    };
  }

  // Payload with credentials - NEVER log this
  const payload = {
    Username: username,
    Password: password,
    Sender: "USKUDARBLD",
    Receivers: [formattedPhone],
    Message: message,
  };

  // Only log safe info
  if (DEBUG) {
    console.log("[SMS] Sending to:", formattedPhone.slice(0, 4) + "****");
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    // Safe logging - no sensitive data
    if (DEBUG) {
      console.log("[SMS] API Response status:", response.status);
    }

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
    // StatusCode 200 = başarılı
    if (
      data.StatusCode === 200 ||
      data.statusCode === 200 ||
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
      const errorMsg = data.StatusDescription || data.message || data.error || data.description || data.error_description || "Bilinmeyen hata";
      // Log error without full response body
      if (DEBUG) {
        console.error("[SMS] API Error:", errorMsg);
      }
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

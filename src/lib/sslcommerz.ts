/**
 * SSLCOMMERZ Official Payment Gateway Utility
 * Handles Payment Session Initiation, Validation, and Transaction Query
 * Isolated from React / UI components.
 */

export interface SslcommerzInitiateParams {
  orderId: string;
  transactionId: string;
  amount: number; // in BDT
  currency?: string; // default "BDT"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity?: string;
  customerState?: string;
  customerPostcode?: string;
  customerCountry?: string;
  productName?: string;
  productCategory?: string;
  deliveryMethod?: string;
}

export interface SslcommerzInitiateResult {
  success: boolean;
  gatewayPageUrl?: string;
  sessionKey?: string;
  error?: string;
  raw?: any;
}

export interface SslcommerzValidationResult {
  isValid: boolean;
  status: "VALID" | "VALIDATED" | "INVALID_TRANSACTION" | "FAILED";
  tranId: string;
  amount: number;
  currency: string;
  bankTranId?: string;
  cardType?: string;
  cardNo?: string;
  cardIssuer?: string;
  cardBrand?: string;
  tranDate?: string;
  valId?: string;
  error?: string;
  raw?: any;
}

/**
 * Resolves the public site base URL for local development and Vercel production
 */
export function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Returns SSLCOMMERZ Gateway Base URL
 * Default: Sandbox gateway
 */
export function getSslcommerzBaseUrl(): string {
  const envUrl = process.env.SSLCOMMERZ_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "https://sandbox.sslcommerz.com";
}

/**
 * Initiates an SSLCOMMERZ Payment Session
 * Calls POST /gwprocess/v4/api.php
 */
export async function initiateSslcommerzPayment(
  params: SslcommerzInitiateParams
): Promise<SslcommerzInitiateResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const baseUrl = getSiteBaseUrl();
  const sslBaseUrl = getSslcommerzBaseUrl();

  if (!storeId || !storePasswd) {
    console.error("[SSLCOMMERZ] Missing SSLCOMMERZ_STORE_ID or SSLCOMMERZ_STORE_PASSWORD in environment.");
    return {
      success: false,
      error: "Payment gateway credentials are not configured. Please check environment variables.",
    };
  }

  const formData = new URLSearchParams();

  // Store Credentials
  formData.append("store_id", storeId);
  formData.append("store_passwd", storePasswd);

  // Transaction & Amount (Server-calculated only)
  formData.append("total_amount", Number(params.amount).toFixed(2));
  formData.append("currency", params.currency || "BDT");
  formData.append("tran_id", params.transactionId);

  // Return Callbacks (Fully qualified absolute URLs for local & Vercel)
  formData.append("success_url", `${baseUrl}/api/payment/sslcommerz/success`);
  formData.append("fail_url", `${baseUrl}/api/payment/sslcommerz/fail`);
  formData.append("cancel_url", `${baseUrl}/api/payment/sslcommerz/cancel`);
  formData.append("ipn_url", `${baseUrl}/api/payment/sslcommerz/ipn`);

  // Product & Order Details
  formData.append("shipping_method", "YES");
  formData.append("num_of_item", "1");
  formData.append("product_name", params.productName || "Noir Atelier Garments");
  formData.append("product_category", params.productCategory || "Luxury Fashion");
  formData.append("product_profile", "general");

  // Customer Information
  formData.append("cus_name", params.customerName || "Valued Client");
  formData.append("cus_email", params.customerEmail || "client@noir.studio");
  formData.append("cus_phone", params.customerPhone || "01700000000");
  formData.append("cus_add1", params.customerAddress || "Atelier Delivery Address");
  formData.append("cus_city", params.customerCity || "Dhaka");
  formData.append("cus_state", params.customerState || "Dhaka");
  formData.append("cus_postcode", params.customerPostcode || "1212");
  formData.append("cus_country", params.customerCountry || "Bangladesh");

  // Shipping Information
  formData.append("ship_name", params.customerName || "Valued Client");
  formData.append("ship_add1", params.customerAddress || "Atelier Delivery Address");
  formData.append("ship_city", params.customerCity || "Dhaka");
  formData.append("ship_state", params.customerState || "Dhaka");
  formData.append("ship_postcode", params.customerPostcode || "1212");
  formData.append("ship_country", params.customerCountry || "Bangladesh");

  // Custom Reference Values for Callback verification
  formData.append("value_a", params.orderId);
  formData.append("value_b", params.transactionId);
  formData.append("value_c", params.customerEmail);

  try {
    const sessionEndpoint = `${sslBaseUrl}/gwprocess/v4/api.php`;
    const response = await fetch(sessionEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
    });

    const responseText = await response.text();
    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("[SSLCOMMERZ] Received non-JSON response from gateway:", responseText.slice(0, 300));
      return {
        success: false,
        error: "Invalid response from SSLCOMMERZ gateway. Please try again.",
      };
    }

    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return {
        success: true,
        gatewayPageUrl: data.GatewayPageURL,
        sessionKey: data.sessionkey,
        raw: data,
      };
    }

    const failureReason = data.failedreason || data.status || "Failed to initialize payment session";
    console.error("[SSLCOMMERZ] Gateway session creation failed:", failureReason);

    return {
      success: false,
      error: failureReason,
      raw: data,
    };
  } catch (err: any) {
    console.error("[SSLCOMMERZ] Network exception during initiate:", err.message);
    return {
      success: false,
      error: `Could not reach SSLCOMMERZ gateway: ${err.message}`,
    };
  }
}

/**
 * Validates a Payment with SSLCOMMERZ Server-side Validation API
 * Calls GET /validator/api/validationserverAPI.php
 */
export async function validateSslcommerzPayment(val_id: string): Promise<SslcommerzValidationResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const sslBaseUrl = getSslcommerzBaseUrl();

  if (!storeId || !storePasswd) {
    console.error("[SSLCOMMERZ] Missing credentials for validation.");
    return {
      isValid: false,
      status: "FAILED",
      tranId: "",
      amount: 0,
      currency: "BDT",
      error: "Missing SSLCOMMERZ credentials",
    };
  }

  const queryParams = new URLSearchParams({
    val_id,
    store_id: storeId,
    store_passwd: storePasswd,
    v: "1",
    format: "json",
  });

  const validationUrl = `${sslBaseUrl}/validator/api/validationserverAPI.php?${queryParams.toString()}`;

  try {
    const response = await fetch(validationUrl, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    const status = data.status;
    const isValid = status === "VALID" || status === "VALIDATED";

    return {
      isValid,
      status: isValid ? "VALID" : "INVALID_TRANSACTION",
      tranId: data.tran_id || "",
      amount: Number(data.amount) || 0,
      currency: data.currency || "BDT",
      bankTranId: data.bank_tran_id,
      cardType: data.card_type,
      cardNo: data.card_no,
      cardIssuer: data.card_issuer,
      cardBrand: data.card_brand,
      tranDate: data.tran_date,
      valId: data.val_id || val_id,
      error: isValid ? undefined : data.error || `Transaction status: ${status}`,
      raw: data,
    };
  } catch (err: any) {
    console.error("[SSLCOMMERZ] Error during transaction validation:", err.message);
    return {
      isValid: false,
      status: "FAILED",
      tranId: "",
      amount: 0,
      currency: "BDT",
      error: err.message,
    };
  }
}

/**
 * Queries Transaction status by merchant transaction ID (tran_id)
 */
export async function querySslcommerzTransaction(tran_id: string): Promise<any> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const sslBaseUrl = getSslcommerzBaseUrl();

  if (!storeId || !storePasswd) return null;

  const queryParams = new URLSearchParams({
    tran_id,
    store_id: storeId,
    store_passwd: storePasswd,
    format: "json",
  });

  const queryUrl = `${sslBaseUrl}/validator/api/merchantTransIDvalidationAPI.php?${queryParams.toString()}`;

  try {
    const response = await fetch(queryUrl, { cache: "no-store" });
    return await response.json();
  } catch (err: any) {
    console.error("[SSLCOMMERZ] Query transaction error:", err.message);
    return null;
  }
}

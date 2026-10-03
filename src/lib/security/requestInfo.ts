import { NextRequest } from "next/server";

export interface ParsedRequestInfo {
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  loginTime: string;
}

/**
 * Extracts client IP address with production reverse-proxy support
 * (Vercel, Cloudflare, Nginx, AWS, standard reverse proxy)
 */
export function extractClientIp(request: NextRequest): string {
  // 1. Cloudflare header
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp)) {
    return cfIp.trim();
  }

  // 2. Vercel specific forwarded header
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const firstVercel = vercelIp.split(",")[0].trim();
    if (isValidIp(firstVercel)) return firstVercel;
  }

  // 3. Standard x-forwarded-for (first IP in chain is client)
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0].trim();
    if (isValidIp(firstIp)) return firstIp;
  }

  // 4. x-real-ip
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp && isValidIp(xRealIp)) {
    return xRealIp.trim();
  }

  // 5. True-client-ip
  const trueClientIp = request.headers.get("true-client-ip");
  if (trueClientIp && isValidIp(trueClientIp)) {
    return trueClientIp.trim();
  }

  // Fallback to localhost or unknown
  return "127.0.0.1";
}

function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  const trimmed = ip.trim();
  // Basic IPv4 check
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // Basic IPv6 check
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  return ipv4Regex.test(trimmed) || ipv6Regex.test(trimmed) || trimmed === "localhost";
}

/**
 * Parses user agent string into human-readable device, browser, and OS
 */
export function parseUserAgent(userAgent: string): {
  device: string;
  browser: string;
  os: string;
} {
  const ua = userAgent || "";

  // 1. Detect Device
  let device = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = "Tablet";
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    device = "Mobile";
  } else if (/bot|crawler|spider|crawling/i.test(ua)) {
    device = "Automated Agent / Bot";
  }

  // 2. Detect Operating System
  let os = "Unknown OS";
  if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6.2/i.test(ua)) os = "Windows 8";
  else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X (\d+([_\.]\d+)+)/i);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS (\d+([_\.]\d+)+)/i);
    os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android (\d+(\.\d+)+)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/CrOS/i.test(ua)) os = "ChromeOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // 3. Detect Browser
  let browser = "Unknown Browser";
  if (/Edg(e)?\/(\d+(\.\d+)?)/i.test(ua)) {
    const m = ua.match(/Edg(e)?\/(\d+(\.\d+)?)/i);
    browser = m ? `Microsoft Edge ${m[2]}` : "Microsoft Edge";
  } else if (/OPR\/(\d+(\.\d+)?)/i.test(ua) || /Opera/i.test(ua)) {
    const m = ua.match(/OPR\/(\d+(\.\d+)?)/i);
    browser = m ? `Opera ${m[1]}` : "Opera";
  } else if (/Chrome\/(\d+(\.\d+)?)/i.test(ua) && !/Chromium/i.test(ua)) {
    const m = ua.match(/Chrome\/(\d+(\.\d+)?)/i);
    browser = m ? `Google Chrome ${m[1]}` : "Google Chrome";
  } else if (/Safari\/(\d+(\.\d+)?)/i.test(ua) && !/Chrome/i.test(ua)) {
    const m = ua.match(/Version\/(\d+(\.\d+)?)/i);
    browser = m ? `Apple Safari ${m[1]}` : "Apple Safari";
  } else if (/Firefox\/(\d+(\.\d+)?)/i.test(ua)) {
    const m = ua.match(/Firefox\/(\d+(\.\d+)?)/i);
    browser = m ? `Mozilla Firefox ${m[1]}` : "Mozilla Firefox";
  }

  return { device, browser, os };
}

/**
 * Extracts approximate geolocation from deployment headers
 */
export function extractLocation(request: NextRequest, ip: string): string {
  // Check Vercel geolocation headers
  const vercelCity = request.headers.get("x-vercel-ip-city");
  const vercelRegion = request.headers.get("x-vercel-ip-country-region");
  const vercelCountry = request.headers.get("x-vercel-ip-country");

  if (vercelCity || vercelCountry) {
    const parts = [
      vercelCity ? decodeURIComponent(vercelCity) : null,
      vercelRegion ? decodeURIComponent(vercelRegion) : null,
      vercelCountry ? decodeURIComponent(vercelCountry) : null,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }

  // Check Cloudflare geolocation headers
  const cfCity = request.headers.get("cf-ipcity");
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCity || cfCountry) {
    const parts = [cfCity, cfCountry].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }

  // Check local loopback
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "Localhost / Internal Network";
  }

  return "Approximate Location via Network";
}

/**
 * Extracts full request info package for login activity
 */
export function getRequestInfo(request: NextRequest): ParsedRequestInfo {
  const ip = extractClientIp(request);
  const rawUserAgent = request.headers.get("user-agent") || "Unknown Device";
  const { device, browser, os } = parseUserAgent(rawUserAgent);
  const location = extractLocation(request, ip);

  const loginTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(new Date()) + " UTC";

  return {
    ip,
    userAgent: rawUserAgent,
    device,
    browser,
    os,
    location,
    loginTime,
  };
}

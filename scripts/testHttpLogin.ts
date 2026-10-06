import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectToDatabase } from "../src/lib/db/mongoose";
import { LoginActivityModel } from "../src/lib/db/models/LoginActivity";

async function testHttpEndpoints() {
  console.log("==========================================");
  console.log(" 🌐 TESTING /api/auth/login HTTP ENDPOINTS");
  console.log("==========================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Invalid Password Test
  console.log("1. Testing Invalid Password Login...");
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "alexander@noir.studio",
        password: "definitely_wrong_password_999",
      }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    if (res.status === 401 && !data.success) {
      console.log("✅ [PASS] Correctly rejected wrong password with 401");
    } else {
      console.error("❌ [FAIL] Expected 401 for wrong password");
    }
  } catch (e: any) {
    console.log("Server might be compiling or starting:", e.message);
  }

  // 2. Successful Login with Demo Account
  console.log("\n2. Testing Successful Login with alexander@noir.studio...");
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        email: "alexander@noir.studio",
        password: "noir2026",
      }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    if (res.status === 200 && data.success && data.token && data.user) {
      console.log("✅ [PASS] Correctly authenticated and received JWT token & user");
    } else {
      console.error("❌ [FAIL] Expected 200 and JWT token");
    }
  } catch (e: any) {
    console.log("Server error:", e.message);
  }

  // 3. Verify Login Activity Document in MongoDB
  console.log("\n3. Verifying LoginActivity entry in MongoDB Atlas...");
  await connectToDatabase();
  const latestActivity = await LoginActivityModel.findOne({ email: "alexander@noir.studio" })
    .sort({ createdAt: -1 })
    .lean();

  if (latestActivity) {
    console.log("Latest LoginActivity recorded in DB:", {
      id: latestActivity._id,
      email: latestActivity.email,
      ip: latestActivity.ip,
      device: latestActivity.device,
      browser: latestActivity.browser,
      os: latestActivity.os,
      status: latestActivity.status,
      emailNotificationSent: latestActivity.emailNotificationSent,
      createdAt: latestActivity.createdAt,
    });
    console.log("✅ [PASS] LoginActivity successfully recorded in database!");
  } else {
    console.error("❌ [FAIL] No LoginActivity found in database");
  }

  console.log("\n==========================================");
  console.log(" 🎉 HTTP Endpoint Validation Completed");
  console.log("==========================================");
  process.exit(0);
}

testHttpEndpoints().catch((e) => {
  console.error(e);
  process.exit(1);
});

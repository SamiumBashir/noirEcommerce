import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

function isServerlessEnvironment(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    (typeof process.cwd === "function" && process.cwd().startsWith("/var/task")) ||
    process.env.NODE_ENV === "production"
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in request." },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/svg+xml",
    ];

    if (!validMimeTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|avif|svg)$/i)) {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Please upload a JPG, PNG, WEBP, or AVIF image." },
        { status: 400 }
      );
    }

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Image file is too large. Maximum allowed size is 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Prioritize Cloudinary CDN upload if credentials are provided
    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(buffer, "noir-products");
        return NextResponse.json({
          success: true,
          url: cloudResult.secure_url,
          provider: "cloudinary",
          public_id: cloudResult.public_id,
          fileName: file.name,
          size: file.size,
          mimeType: file.type,
        });
      } catch (cloudErr: any) {
        console.error("Cloudinary upload error:", cloudErr);

        // In serverless/Vercel, disk is read-only (EROFS). Do not attempt local file write.
        if (isServerlessEnvironment()) {
          return NextResponse.json(
            {
              success: false,
              error: `Cloudinary upload failed: ${cloudErr.message || "Authentication error"}. Please check your Cloudinary credentials in Vercel Environment Variables.`,
            },
            { status: 500 }
          );
        }

        console.warn("Cloudinary upload failed, attempting local storage fallback:", cloudErr.message);
      }
    } else {
      // Cloudinary is not configured
      // In serverless/Vercel, disk is read-only (EROFS). Prevent local write attempt.
      if (isServerlessEnvironment()) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cloudinary is not configured in Vercel. In serverless hosting (Vercel), local disk storage is read-only (EROFS). Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel Project Settings > Environment Variables, then redeploy.",
          },
          { status: 400 }
        );
      }
    }

    // 2. Fallback to local /public/uploads/ storage (only in local development)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Build sanitized, unique filename
      const ext = path.extname(file.name) || ".jpg";
      const rawName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "");
      const safeBase = rawName.substring(0, 30) || "product";
      const fileName = `${Date.now()}-${safeBase}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        provider: "local",
        fileName,
        size: file.size,
        mimeType: file.type,
      });
    } catch (fsErr: any) {
      if (fsErr.code === "EROFS" || fsErr.message?.includes("read-only")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cannot write to local storage: Read-only serverless environment. Please configure Cloudinary environment variables in Vercel to store uploaded images.",
          },
          { status: 500 }
        );
      }
      throw fsErr;
    }
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}

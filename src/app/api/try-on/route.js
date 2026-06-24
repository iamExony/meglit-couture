import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCustomerToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";

const FASHN_API = "https://api.fashn.ai/v1";

function mapCategory(productCategory) {
  const cat = (productCategory || "").toLowerCase();
  if (cat.includes("top") || cat.includes("blouse") || cat.includes("shirt")) return "tops";
  if (cat.includes("trouser") || cat.includes("pant") || cat.includes("skirt")) return "bottoms";
  // "auto" lets Fashn.ai detect the garment type from the image itself
  return "auto";
}

export async function POST(request) {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  const session = await verifyCustomerToken(token);
  if (!session) {
    return NextResponse.json({ error: "Please sign in to use virtual try-on." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { garmentImageUrl, modelImageBase64, category } = body;
  if (!garmentImageUrl || !modelImageBase64) {
    return NextResponse.json({ error: "garmentImageUrl and modelImageBase64 are required." }, { status: 400 });
  }

  const apiKey = process.env.FASHAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Try-on service is not configured." }, { status: 500 });
  }

  // Start the try-on prediction
  let predId;
  try {
    const startRes = await fetch(`${FASHN_API}/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "tryon-v1.6",
        inputs: {
          model_image: modelImageBase64,
          garment_image: garmentImageUrl,
          category: mapCategory(category),
          garment_photo_type: "model",
          mode: "quality",
          output_format: "jpeg",
          segmentation_free: true,
        },
      }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      console.error("Fashn.ai start error:", err);
      return NextResponse.json({ error: "Try-on service error. Please try again." }, { status: 502 });
    }

    const startData = await startRes.json();
    predId = startData.id;
    console.log("Fashn.ai started:", JSON.stringify(startData));
  } catch (err) {
    console.error("Fashn.ai request failed:", err);
    return NextResponse.json({ error: "Could not reach try-on service." }, { status: 502 });
  }

  // Poll for result (max 60 s, every 2.5 s)
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2500));

    try {
      const statusRes = await fetch(`${FASHN_API}/status/${predId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!statusRes.ok) continue;

      const statusData = await statusRes.json();

      if (statusData.status === "completed") {
        console.log("Fashn.ai completed:", JSON.stringify(statusData));
        const imageUrl = statusData.output?.[0] ?? statusData.output_images?.[0];
        if (imageUrl) return NextResponse.json({ imageUrl });
        return NextResponse.json({ error: "Try-on completed but no image was returned." }, { status: 422 });
      }
      if (statusData.status === "failed" || statusData.status === "error") {
        return NextResponse.json(
          { error: "Try-on failed. Try a clearer full-body photo." },
          { status: 422 }
        );
      }
    } catch {
      // transient network blip — keep polling
    }
  }

  return NextResponse.json(
    { error: "Try-on timed out. Please try again in a moment." },
    { status: 504 }
  );
}

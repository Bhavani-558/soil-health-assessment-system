import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    if (!body || !body.text) {
      return NextResponse.json(
        { success: false, detail: "Text prompt is required for voice generation." },
        { status: 400 }
      );
    }

    const backendUrl = `${FASTAPI_URL}/api/voice`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      let errDetail = "FastAPI Sarvam voice endpoint error.";
      try {
        const errJson = await response.json();
        if (errJson?.detail) errDetail = errJson.detail;
      } catch (_) {}
      console.error(`[TTS Proxy] Backend error ${response.status} in ${duration}ms: ${errDetail}`);
      return NextResponse.json(
        { success: false, detail: errDetail },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[TTS Proxy] Backend responded successfully in ${duration}ms`);

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error: any) {
    console.error(`[TTS Proxy] Connection error after ${Date.now() - startTime}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        detail: "Unable to connect to Sarvam AI voice backend service.",
      },
      { status: 500 }
    );
  }
}

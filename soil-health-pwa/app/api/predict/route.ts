import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const incomingFormData = await request.formData();

    const response = await fetch(
      "http://10.229.174.90:8000/predict/",
      {
        method: "POST",
        body: incomingFormData,
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Predict proxy error:", error);

    return NextResponse.json(
      {
        detail: "Unable to connect to the Soil Health backend.",
      },
      { status: 502 }
    );
  }
}
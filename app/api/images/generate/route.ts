import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: description,
        image_size: "landscape_16_9",
      },
      pollInterval: 5000,
      logs: true,
      onQueueUpdate(update) {
        console.log("queue update", update);
      },
    });

    return NextResponse.json({ imageUrl: result.data.images[0].url });
  } catch (error) {
    console.error("Failed to generate image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
} 
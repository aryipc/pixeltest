
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function fileToBase64(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    }
  };
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const imageFile = formData.get("image") as File;

  if (!imageFile) {
    return new Response(JSON.stringify({ error: "No image uploaded." }), { status: 400 });
  }

  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Part = fileToBase64(buffer, imageFile.type);

  const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
  const imageModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });

  if (typeof imageModel.generateImages !== "function") {
    return new Response(JSON.stringify({
      error: "generateImages is not available. Please upgrade '@google/generative-ai'."
    }), { status: 500 });
  }

  const prompt = `Analyze the user-uploaded image. Your task is to generate a detailed text prompt to create a complete Pokémon TCG card.

1. Invent Pokémon name, HP, type.
2. Create two attacks with names, damage, effects.
3. Write a short Pokédex entry.
4. Assemble the full prompt to describe a full Pokémon card, yellow-bordered, with the user's character as main artwork.

**The card must contain sharp, readable, correctly spelled English text.**
`;

  try {
    const result = await visionModel.generateContent({
      contents: [{ role: "user", parts: [base64Part, { text: prompt }] }]
    });

    const generatedPrompt = result.response.text();

    const imageResult = await imageModel.generateImages({
      prompt: generatedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "3:4",
        negativePrompt: "blurry text, gibberish, unreadable"
      }
    });

    const imageBytes = imageResult.images?.[0]?.data;
    return new Response(JSON.stringify({ image: imageBytes }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

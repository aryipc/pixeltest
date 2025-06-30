
import { GoogleGenAI } from "@google/genai";

// This function will be triggered by POST requests to /api/generate-pokemon-card
export async function POST(request: Request) {
  // 1. Check for API Key
  if (!process.env.API_KEY) {
    return new Response(
        JSON.stringify({ message: "API key is not configured on the server." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 2. Extract image from the request
  let imageFile: File;
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!file || !(file instanceof File)) {
      throw new Error("No image file found in the request.");
    }
    imageFile = file;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request body.";
    return new Response(JSON.stringify({ message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Helper function to convert File to a GoogleGenAI.Part object.
  const fileToGenerativePart = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const base64EncodedData = Buffer.from(buffer).toString('base64');
    return {
      inlineData: { data: base64EncodedData, mimeType: file.type },
    };
  };

  // 3. Run the AI generation logic
  try {
    const visionModel = 'gemini-2.5-flash-preview-04-17';
    const imageModel = 'imagen-3.0-generate-002';

    const imagePart = await fileToGenerativePart(imageFile);

    const promptForVisionModel = `You are an expert prompt engineer for a text-to-image AI (Imagen 3). Your goal is to create a flawless prompt to generate a single Pokémon TCG card based on a user's image.

**CRITICAL FAILURE CONDITION:** The generation is an INSTANT FAILURE if any text on the card is illegible, misspelled, garbled, or nonsensical. All text MUST be perfect, readable, and in correctly-spelled English. This is the single most important rule.

**INSTRUCTIONS:**
Analyze the user's image and create a single, detailed paragraph prompt for Imagen 3.

1.  **Analyze and Describe:** Look at the main subject in the user's image. Describe its appearance for the art generation (e.g., "A small, fierce rabbit-like creature in a green samurai outfit, wielding two small katanas").
2.  **Invent Pokémon Details**: Based on the subject, invent a creative Pokémon name, HP (e.g., "HP 90"), and a Pokémon type (e.g., Grass, Fighting).
3.  **Invent Two Attacks**: Create two distinct attacks. For each, specify its name, a simple description of its effect, and a damage number (e.g., "Attack 1: 'Dual Slice', 30 damage, Flips two coins. Does 30 damage for each heads.").
4.  **Write Pokédex Entry**: Write a short, creative Pokédex-style description based on the subject.
5.  **Assemble the Final Prompt**: Combine everything into one single paragraph. Start with quality keywords. The prompt must explicitly state all the invented details (name, HP, attacks, Pokédex entry). The art style for the main subject should be identical to the user's uploaded image, placed within a classic Pokémon TCG card frame.

**FINAL PROMPT STRUCTURE EXAMPLE:**
"Masterpiece, ultra-detailed, sharp focus, professional trading card game art. A complete Pokémon TCG card in the classic 1999 base set style. The main artwork features [Description from Step 1]. The Pokémon's name is '[Name]'. It is a [Type]-type Pokémon with [HP] HP. It has two attacks. The first is '[Attack 1 Name]', which does [Damage] damage and has the effect: '[Effect]'. The second is '[Attack 2 Name]', which does [Damage] damage and has the effect: '[Effect]'. The Pokédex entry at the bottom reads: '[Pokédex Entry]'. **MANDATORY:** All text elements (name, HP, attacks, descriptions, card numbers) must be rendered in perfect, clear, razor-sharp, correctly-spelled English. NO GIBBERISH. NO BLURRY TEXT."

Your output MUST be ONLY the final, single-paragraph prompt. Do not include explanations, titles, or markdown formatting.`;
    
    const visionResponse = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, { text: promptForVisionModel }] },
        config: {
            temperature: 0.4,
        }
    });

    let detailedPrompt = visionResponse.text?.trim() ?? "";

    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = detailedPrompt.match(fenceRegex);
    if (match && match[2]) {
      detailedPrompt = match[2].trim();
    }

    if (!detailedPrompt) {
        throw new Error("The vision model failed to generate a detailed prompt.");
    }
    
    const imageResponse = await ai.models.generateImages({
        model: imageModel,
        prompt: detailedPrompt,
        config: { 
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '3:4',
        },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const imageUrls = imageResponse.generatedImages.reduce<string[]>((acc, img) => {
            const base64ImageBytes = img.image?.imageBytes;
            if (base64ImageBytes) {
                acc.push(`data:image/jpeg;base64,${base64ImageBytes}`);
            }
            return acc;
        }, []);

        if (imageUrls.length === 0) {
            throw new Error("The API returned image objects but they contained no data.");
        }
        
        return new Response(JSON.stringify({ imageUrls }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        throw new Error("No images were generated by the API.");
    }
  } catch (error) {
    console.error("Error in Pokémon card generation process:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during generation.";
    return new Response(
        JSON.stringify({ message: `The API failed to process the request: ${message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

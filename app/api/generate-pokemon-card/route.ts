
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
  // This needs to run on a server environment that supports Buffer.
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

    const promptForVisionModel = `Analyze the user-uploaded image. Your task is to generate a single, detailed text prompt for an AI image generation model (Imagen 3). This prompt will instruct the model to create a complete Pokémon TCG card featuring the subject of the user's image as the Pokémon.

**CRITICAL INSTRUCTION: All text on the generated card MUST be sharp, clear, legible, and correctly spelled English. This is the most important requirement.**

Follow these instructions precisely:
1.  **Invent Pokémon Details**: Based on the image, create a plausible Pokémon name, HP (e.g., "HP 120"), and a type (e.g., Grass, Fire, Water, Electric, Psychic, Fighting, etc.).
2.  **Create Attacks**: Invent two attacks. Each attack should have a name, a short description of what it does, and a damage value (e.g., "Vine Whip. 30 damage. Flip a coin. If heads, the Defending Pokémon is now Paralyzed.").
3.  **Write a Pokédex Entry**: Write a short Pokédex-style description based on the visual characteristics and implied behavior of the subject in the image.
4.  **Assemble the Prompt**: Combine all the invented details with a description of the classic Pokémon card layout. The final prompt must instruct Imagen to place the subject from the user's image into the picture frame of the card. The art style of the subject inside the card's frame should be identical to the user's uploaded image. **Reiterate in the prompt that all text must be legible English.**

Your output must ONLY be the final, detailed prompt for Imagen. Do not add any other text, explanations, or markdown formatting. Do not use markdown.

Example of a final prompt for Imagen: "A complete Pokémon TCG card, photorealistic, high detail. The Pokémon in the main art is a photo-realistic image of a small, fluffy, white dog sitting in a grassy field. The card's name is 'Puppup'. It is a Normal type with HP 70. The first attack is 'Play Fetch', which does 10 damage. The second attack is 'Fierce Bark', which does 30 damage. The Pokédex entry at the bottom reads: 'This Pokémon is known for its loyalty and playful nature, often chasing its own tail for hours.' The card has a classic yellow border and layout of the original Pokémon Trading Card Game. **Crucially, all text on the card (name, HP, attacks, description) must be sharp, clear, and perfectly legible English.**"`;
    
    const visionResponse = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, { text: promptForVisionModel }] },
        config: {
            temperature: 0.2,
        }
    });

    let detailedPrompt = visionResponse.text?.trim() ?? "";

    // The model can sometimes wrap the response in markdown fences.
    // This removes them to ensure a clean prompt for the image model.
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
            numberOfImages: 4,
            outputMimeType: 'image/jpeg',
            aspectRatio: '3:4',
        },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const imageUrls = imageResponse.generatedImages.reduce<string[]>((acc, img) => {
            // Safely access imageBytes using optional chaining.
            const base64ImageBytes = img.image?.imageBytes;
            // Only create a URL if the image data exists.
            if (base64ImageBytes) {
                acc.push(`data:image/jpeg;base64,${base64ImageBytes}`);
            }
            return acc;
        }, []);

        // Handle the case where the API returned image objects but they were empty.
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

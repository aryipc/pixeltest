
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

    const promptForVisionModel = `You are an expert prompt engineer for a text-to-image AI. Your task is to create a perfect prompt for Imagen 3 to generate a Pokémon TCG card based on a user's image.

**THE ABSOLUTE #1 RULE: The final generated image MUST have perfectly sharp, legible, and correctly spelled English text for all text elements on the card (Name, HP, attacks, descriptions, etc.). Gibberish, misspelled, or blurry text is a failure. This is the most critical instruction.**

Based on the user's image, create a single, cohesive prompt for Imagen 3 by following these steps:

1.  **Invent Pokémon Details**: Create a plausible Pokémon name, HP (e.g., "HP 120"), and a Pokémon type (e.g., Grass, Fire, Water, Electric, Psychic, Fighting).
2.  **Create Attacks**: Invent two attacks. Each attack needs a name, a short description of its effect, and a damage value (e.g., "Razor Leaf. 40 damage. Flip a coin, if heads this attack does 10 more damage.").
3.  **Write Pokédex Entry**: Write a short, creative Pokédex-style description based on the subject in the user's image.
4.  **Describe the Visuals**: Instruct the model to place the subject from the user's image into the card's main artwork frame. The art style of the subject inside the card's frame should be identical to the user's uploaded image. The overall card design should be in the style of the classic Pokémon TCG.
5.  **Assemble the Final Prompt**: Combine all the details above into a single, detailed paragraph. Start the prompt with phrases that emphasize quality like "masterpiece, high detail, photorealistic". End the prompt by re-stating the critical rule about text.

Your output must ONLY be the final prompt for Imagen. Do not add any other text, explanations, or markdown formatting.

Example of a final prompt structure: "Masterpiece, photorealistic, high detail. A complete Pokémon TCG card in the classic style. The Pokémon in the main art is [description of subject from user's image]. The card's name is '[Name]'. It is a [Type] type with [HP] HP. The first attack is '[Attack 1 Name]', deals [Damage] damage, and its effect is '[Effect]'. The second attack is '[Attack 2 Name]', deals [Damage] damage, and its effect is '[Effect]'. The Pokédex entry reads: '[Pokedex text]'. **Crucially, all text on the card must be perfectly legible, razor-sharp, and in clear, correctly-spelled English.**"`;
    
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
            numberOfImages: 1,
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

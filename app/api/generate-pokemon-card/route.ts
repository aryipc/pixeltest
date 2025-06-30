
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

    const promptForVisionModel = `You are a creative assistant that designs Pokémon cards. Analyze the user's image and invent the details for a new Pokémon.

    **YOUR TASK:**
    Based on the image, generate a JSON object with the following structure:
    {
      "subject_description": "A detailed visual description of the main subject in the user's image. For example: 'A grand piano with a glossy black finish, standing on a stage.'",
      "pokemon_name": "A creative, one- or two-word Pokémon name for the subject. e.g., 'Pianorte'",
      "hp": "An HP value between 60 and 120. e.g., 80",
      "pokemon_type": "A standard Pokémon type. e.g., 'Steel'",
      "attack_1_name": "Name of a single attack. e.g., 'Chord Strike'",
      "attack_1_description": "A very short (10-15 words) description of the attack's effect. e.g., 'Plays a powerful chord that resonates. This attack's damage isn't affected by Resistance.'",
      "attack_1_damage": "The damage number for the attack. e.g., 50",
      "pokedex_entry": "A short, creative Pokédex-style description (15-20 words). e.g., 'This Pokémon's melodies can soothe even the most aggressive spirits, but its dissonant chords can shatter rock.'"
    }

    **RULES:**
    - All text values in the JSON must be in perfect, correctly-spelled English.
    - Be creative and stick to the Pokémon theme.
    - Your output MUST be ONLY the JSON object, with no other text, comments, or markdown formatting.`;

    const visionResponse = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, { text: promptForVisionModel }] },
        config: {
            temperature: 0.8,
            responseMimeType: "application/json",
        }
    });

    let jsonStr = visionResponse.text?.trim() ?? "";
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    let cardData;
    try {
        cardData = JSON.parse(jsonStr);
    } catch(e) {
        console.error("Failed to parse JSON from vision model:", jsonStr);
        throw new Error("The AI failed to generate valid card data. Please try again.");
    }
    
    const detailedPrompt = `Photorealistic, masterpiece, high-detail, professional trading card game art. A complete Pokémon TCG card in the classic 1999 base set style. The main artwork features: ${cardData.subject_description}.

**CRITICAL TEXT RENDERING INSTRUCTIONS:**
- The Pokémon's name on the card MUST be EXACTLY: "${cardData.pokemon_name}"
- The HP in the top-right corner MUST be EXACTLY: "${cardData.hp} HP"
- The type of the pokemon is: "${cardData.pokemon_type}"
- The first attack's name MUST be EXACTLY: "${cardData.attack_1_name}"
- The first attack's damage MUST be EXACTLY: "${cardData.attack_1_damage}"
- The first attack's description text MUST be: "${cardData.attack_1_description}"
- The Pokédex entry text at the bottom MUST be: "${cardData.pokedex_entry}"

**ABSOLUTE MANDATORY REQUIREMENT:** ALL text on the card must be perfectly rendered, crisp, legible, and spelled correctly in English. THERE MUST BE NO GIBBERISH, ARTIFACTS, OR MISSPELLED WORDS. The text content must match the instructions above exactly. This is the highest priority.`;

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

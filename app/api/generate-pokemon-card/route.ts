
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
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64EncodedData = btoa(binaryString);
    
    return {
      inlineData: { data: base64EncodedData, mimeType: file.type },
    };
  };

  // 3. Run the AI generation logic
  try {
    const visionModel = 'gemini-2.5-flash-preview-04-17';
    const imageModel = 'imagen-3.0-generate-002';

    const imagePart = await fileToGenerativePart(imageFile);

    // Step 1: Generate structured card data using the vision model.
    const promptForVisionModel = `You are a creative assistant that designs Trenchmon cards, inspired by the chaotic and degen world of Solana memecoins. Analyze the user's image and invent the details for a new Trenchmon.

    **YOUR TASK:**
    Based on the image, generate a JSON object with the following structure. Embrace the memecoin slang and culture in your text generations.

    {
      "subject_description": "A detailed visual description of the main subject in the user's image. For example: 'A cartoon frog wearing a backwards baseball cap and gold chain.'",
      "trenchmon_name": "A creative, one- or two-word memecoin-style name for the subject. e.g., 'Degen Toad'",
      "mc": "A market cap value. This can be a string like '10K MC', '1.5M MC', or '300M MC'. Be creative based on the subject's vibe.",
      "trenchmon_type": "A Trenchmon type from this list: Ape, Shill, Rug, Whale, Diamond-Hand, Based, Cringe.",
      "dev": "A developer type from this list: Anon Dev, Based Dev, Rug Puller.",
      "risk_level": "A risk level from this list: SAFU, Low, Medium, High, DEGEN.",
      "rarity": "A rarity level from this list, chosen based on a combination of the other attributes (a 'Based Dev' with 'SAFU' risk is likely 'Legendary'): Common, Uncommon, Rare, Epic, Legendary.",
      "attack_1_name": "Name of a single attack, using crypto slang. e.g., 'Diamond Hands'",
      "attack_1_description": "A very short (10-15 words) description of the attack's effect, using crypto slang. e.g., 'This Trenchmon cannot be sold for 3 turns. It HODLs.'",
      "attack_1_damage": "The damage number for the attack (a multiple of 10). e.g., 60",
      "trench_log": "A short, creative project description, like a memecoin's 'about' section (15-25 words). e.g., 'Launched with no presale and a burnt LP, this Trenchmon is for the community. To the moon or to the trenches!'"
    }

    **RULES:**
    - All text values in the JSON must be in perfect, correctly-spelled English.
    - The trenchmon_type, dev, risk_level, and rarity MUST be one of the provided options.
    - Your output MUST be ONLY the JSON object, with no other text, comments, or markdown formatting.`;

    const visionResponse = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, { text: promptForVisionModel }] },
        config: {
            temperature: 0.9,
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
    
    // Step 2: Generate only the Trenchmon's artwork using the image model.
    const artworkPrompt = `Masterpiece, professional trading card game art. A portrait-style illustration (3:4 aspect ratio) of the following character: "${cardData.subject_description}".
The art style should be a gritty, sticker-style, or like a crypto-native PFP project. Edgy and cool.
The background should be simple, thematically matching a ${cardData.trenchmon_type}-type Trenchmon.
The image should be a centered, full-body shot of the character.
Do NOT include any text, borders, or card elements. ONLY the artwork.`;

    const imageResponse = await ai.models.generateImages({
        model: imageModel,
        prompt: artworkPrompt,
        config: { 
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '3:4', // Portrait artwork
        },
    });

    const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (base64ImageBytes) {
      const artworkUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      
      return new Response(JSON.stringify({ cardData, artworkUrl }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
      });

    } else {
        throw new Error("No artwork was generated by the API.");
    }
  } catch (error) {
    console.error("Error in Trenchmon card generation process:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during generation.";
    return new Response(
        JSON.stringify({ message: `The API failed to process the request: ${message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    // Ensure the API key is available from environment variables
    if (!process.env.API_KEY) {
        // This will be caught by the calling function and displayed in the UI.
        throw new Error("API_KEY environment variable not set. Please configure it in your hosting environment.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
};

// Helper to convert a File object to a GoogleGenAI.Part object.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

// Internal function to describe an image using a Gemini model.
const describeImageForGeneration = async (imagePart: { inlineData: { data: string; mimeType:string; } }) => {
    const model = 'gemini-2.5-flash-preview-04-17';
    const prompt = `You are a master artist's assistant, tasked with creating a detailed description of the character AND their environment from the provided image. This description will be used by another AI to generate 16-bit pixel art. Precision is paramount.

    **Your Instructions - Follow them without deviation:**

    1.  **ANALYZE CHARACTER - START WITH HEADWEAR:**
        *   **Headwear is critical:** Scrutinize it. Is it a **cap** (like a baseball cap)? State the type and how it's worn. Example: "a yellow and black trucker cap worn backwards". Is it a **beanie**? Describe it as such.
        *   **STRICT PROHIBITION:** You MUST NOT describe a cap as a 'bandana' or 'headband'. Failure to distinguish this correctly will ruin the result.
        *   **Text & Logos:** Meticulously find and transcribe EVERY piece of text and EVERY logo on all clothing and accessories. Be EXACT. Quote text precisely. Example: "On the cap is a Gadsden snake logo and text 'DON'T TREAD ON ME'."
        *   **Other Attire:** Detail every other item: "white-framed sunglasses", "a simple white tank top".
        *   **Physical Features:** Briefly describe hair, eyes, and expression.

    2.  **DESCRIBE THE BACKGROUND SCENERY:**
        *   Now, describe the environment.
        *   Mention all key elements. Example: "The character is in front of a swimming pool with blue water. Behind the pool are large classical pillars, palm trees, and Egyptian pyramids under a purple and orange sunset sky with stars."

    3.  **WHAT TO IGNORE:**
        *   Do not mention the image style (e.g., 'cartoonish', '3D render'). Focus only on the content.

    **Final Output Format:**
    Combine all character and background observations into a single, comprehensive descriptive paragraph. This is your ONLY output.`;
    
    const response: GenerateContentResponse = await getAi().models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: { thinkingConfig: { thinkingBudget: 0 } } // Optimize for speed
    });

    return response.text;
};

// Internal function to generate an image using Imagen from a text prompt.
const generateImageFromText = async (prompt: string) => {
  const enhancedPrompt = `Authentic 16-bit pixel art in the style of a late 1980s Sega Genesis/Mega Drive game. Punchy, vibrant colors from a constrained palette. Sharp, defined pixel work with character sprites that stand out. No anti-aliasing, no text, watermarks or labels on the final image. --style raw.

Scene description: ${prompt}`;

  const response = await getAi().models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: enhancedPrompt,
    config: { numberOfImages: 1, outputMimeType: 'image/png' },
  });

  if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } else {
    // This can happen if generation is blocked due to safety policies.
    throw new Error("Image generation failed. The prompt might have been blocked. Please try a different prompt or image.");
  }
}

/**
 * Generates pixel art from a source image. It works by first describing the image
 * and then feeding that description into the image generator.
 * @param sourceFile A source image file for image-to-image generation.
 * @returns A base64 encoded data URL of the generated PNG image.
 */
export const generatePixelArt = async (sourceFile: File): Promise<string> => {
  try {
    // Image-to-Image flow is now the only flow
    const imagePart = await fileToGenerativePart(sourceFile);
    const imageDescription = await describeImageForGeneration(imagePart);
    
    // The image description becomes the prompt for the image generator.
    return await generateImageFromText(imageDescription);

  } catch (error) {
     console.error("Error in generatePixelArt service:", error);
     // Re-throw a user-friendly error message to be displayed in the UI
     if (error instanceof Error) {
        throw new Error(`Generation failed: ${error.message}`);
     }
     throw new Error("An unknown error occurred during the generation process.");
  }
};
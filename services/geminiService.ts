
export interface CardData {
  subject_description: string;
  trenchmon_name: string;
  mc: string;
  trenchmon_type: string;
  dev: string;
  risk_level: string;
  rarity: string;
  attack_1_name: string;
  attack_1_description: string;
  attack_1_damage: string;
  trench_log: string;
}

export interface GenerationResult {
  cardData: CardData;
  artworkUrl: string;
}


export async function generateTrenchmonCard(imageFile: File): Promise<GenerationResult> {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    // The endpoint name is kept for simplicity, but the logic is all new.
    const response = await fetch('/api/generate-pokemon-card', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result: GenerationResult = await response.json();
    if (!result.cardData || !result.artworkUrl) {
        throw new Error("The server response was incomplete.");
    }
    return result;
  } catch (error) {
    console.error("Error calling backend service:", error);
    if (error instanceof Error) {
        // Re-throw the error with a more user-friendly message for the UI to catch.
        throw new Error(error.message);
    }
    throw new Error("An unknown network error occurred.");
  }
}

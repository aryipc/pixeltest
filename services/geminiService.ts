
export async function generatePokemonCard(imageFile: File): Promise<string[]> {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch('/api/generate-pokemon-card', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.imageUrls) {
        throw new Error("The server response did not contain image URLs.");
    }
    return result.imageUrls;
  } catch (error) {
    console.error("Error calling backend service:", error);
    if (error instanceof Error) {
        // Re-throw the error with a more user-friendly message for the UI to catch.
        throw new Error(error.message);
    }
    throw new Error("An unknown network error occurred.");
  }
}

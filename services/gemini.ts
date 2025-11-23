import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Only initialize if API key is present
if (process.env.API_KEY) {
  client = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const analyzeImageArt = async (
  imageBase64: string,
  onUpdate: (text: string) => void
): Promise<void> => {
  if (!client) {
    onUpdate("API Key not found. Cannot analyze image.");
    return;
  }

  try {
    const modelId = "gemini-2.5-flash"; // Fast and efficient for descriptions
    
    // Remove header from base64 string if present (data:image/png;base64,...)
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const response = await client.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          {
            text: "You are an avant-garde art critic. Provide a very short, cryptic, cyberpunk-style title for this image, followed by a one-sentence abstract interpretation of its visual soul. Format: 'TITLE' - Interpretation.",
          },
        ],
      },
    });

    if (response.text) {
      onUpdate(response.text);
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    onUpdate("Error analyzing neural patterns.");
  }
};
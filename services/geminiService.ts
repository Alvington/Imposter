
import { GoogleGenAI, Type } from "@google/genai";
import { GameData, Source, Difficulty, CustomItem } from "../types.ts";

/**
 * Safely generates game data by initializing the AI client within the request scope.
 * This prevents the app from crashing on load if process.env is not defined in the browser.
 */
export async function generateGameData(
  category: string, 
  difficulty: Difficulty, 
  customItems?: CustomItem[]
): Promise<GameData> {
  // Use process.env.API_KEY directly as per Gemini API guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const seed = Math.floor(Math.random() * 1000000);
  
  let prompt = "";
  
  if (customItems && customItems.length > 0) {
    const itemsJson = JSON.stringify(customItems);
    prompt = `Imposter Game: Custom Category "${category}".
    User-provided data: ${itemsJson}
    
    TASK: Pick ONE item from the provided list. 
    Refine the "hint" to be appropriate for ${difficulty} difficulty.
    - EASY: Hint is very helpful.
    - EXPERT: Hint is extremely cryptic.
    
    Return a valid JSON object:
    {
      "word": "The word from the list",
      "hint": "The refined cryptic hint"
    }`;
  } else {
    const difficultyPrompt = {
      [Difficulty.EASY]: "Basic, universally recognized concepts.",
      [Difficulty.AVERAGE]: "Standard knowledge.",
      [Difficulty.ADVANCED]: "Niche details.",
      [Difficulty.EXPERT]: "Obscure or highly specialized trivia."
    };

    prompt = `Imposter Game Setup:
    Category: "${category}"
    Difficulty Level: "${difficulty}"
    Constraint: ${difficultyPrompt[difficulty]}
    
    TASK: Generate a "Secret Word" and a "Cryptic Hint".
    
    RULES:
    1. The "hint" is for the Imposter. It should describe the "word" without naming it.
    2. Use Google Search to find unique examples.
    
    Return a valid JSON object:
    {
      "word": "The specific secret word",
      "hint": "The descriptive cryptic hint"
    }
    
    Seed: ${seed}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            hint: { type: Type.STRING },
          },
          required: ["word", "hint"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    const data = JSON.parse(text.trim());
    
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title || 'Source'
          });
        }
      });
    }

    return { ...data, sources: sources.length > 0 ? sources : undefined } as GameData;

  } catch (error) {
    console.error("Error generating game data:", error);
    if (customItems && customItems.length > 0) {
      const randomItem = customItems[Math.floor(Math.random() * customItems.length)];
      return { word: randomItem.word, hint: randomItem.hint };
    }
    const fallbacks: Record<string, GameData[]> = {
      "Bible": [{ word: "Manna", hint: "The edible substance provided during the desert travel" }],
      "Silly & Random": [{ word: "Slinky", hint: "A spring that walks down stairs" }]
    };
    const options = fallbacks[category] || fallbacks["Silly & Random"];
    return options[Math.floor(Math.random() * options.length)];
  }
}

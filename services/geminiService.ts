import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { PropertyReport } from "../types.ts";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchPropertyReport(address: string): Promise<PropertyReport> {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Generate a detailed property area report for the address: "${address}" in England.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            address: { type: Type.STRING },
            postcode: { type: Type.STRING },
            broadband: {
              type: Type.OBJECT,
              properties: {
                providers: { type: Type.ARRAY, items: { type: Type.STRING } },
                maxSpeed: { type: Type.STRING },
                uploadSpeed: { type: Type.STRING },
                latency: { type: Type.STRING },
                fiberAvailable: { type: Type.BOOLEAN },
                description: { type: Type.STRING }
              },
              required: ['providers', 'maxSpeed', 'uploadSpeed', 'latency', 'fiberAvailable', 'description']
            },
            shops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  distance: { type: Type.STRING }
                },
                required: ['name', 'type', 'distance']
              }
            },
            schools: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  ofstedRating: { type: Type.STRING },
                  distance: { type: Type.STRING }
                },
                required: ['name', 'type', 'ofstedRating', 'distance']
              }
            },
            crime: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING },
                recentStats: { type: Type.STRING },
                commonTypes: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['level', 'recentStats', 'commonTypes']
            },
            floodRisk: {
              type: Type.OBJECT,
              properties: {
                riskLevel: { type: Type.STRING },
                details: { type: Type.STRING }
              },
              required: ['riskLevel', 'details']
            },
            summary: { type: Type.STRING }
          },
          required: ['address', 'postcode', 'broadband', 'shops', 'schools', 'crime', 'floodRisk', 'summary']
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error fetching report:", error);
    throw new Error("Failed to generate report. Please check the address and try again.");
  }
}

export async function* fetchDeepAnalysisStream(report: PropertyReport): AsyncGenerator<string> {
  const ai = getAI();
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    Analyze this UK property report for long-term investment and quality of life:
    ${JSON.stringify(report)}
    Structure: Gentrification potential, School landscape, Connectivity impact, and Lifestyle score.
    Use professional Markdown. Be concise.
  `;

  try {
    const result = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 12000 }
      },
    });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) yield c.text;
    }
  } catch (error) {
    yield "The model was unable to complete the deep analysis at this time.";
  }
}

export async function fetchAudioSummary(text: string): Promise<string> {
  const ai = getAI();
  const model = 'gemini-2.5-flash-preview-tts';
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: `Read this summary naturally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (error) {
    return "";
  }
}
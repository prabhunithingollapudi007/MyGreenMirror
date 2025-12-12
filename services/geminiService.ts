import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert Blob to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((reader.result as string).split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A concise summary of the analyzed content and its environmental context." },
    mainCategory: { 
      type: Type.STRING, 
      enum: ['Waste', 'Transport', 'Food', 'Energy', 'Lifestyle'],
      description: "Classify the main activity into one of these categories." 
    },
    totalCarbonScore: { type: Type.NUMBER, description: "An estimated impact score from 0 (Eco-friendly) to 100 (High Carbon Footprint)." },
    generalTips: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of general actionable eco-tips based on the analysis." 
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the item." },
          name: { type: Type.STRING, description: "Name of the detected object or activity." },
          category: { 
            type: Type.STRING, 
            enum: ['Recyclable', 'Compostable', 'Landfill', 'Hazardous', 'Reusable', 'Other'],
            description: "The waste category or activity type." 
          },
          carbonFootprint: { type: Type.NUMBER, description: "Estimated carbon impact in grams of CO2e." },
          impactDescription: { type: Type.STRING, description: "Short explanation of why this has this impact." },
          suggestion: { type: Type.STRING, description: "Specific tip to optimize this item." },
          box: {
            type: Type.OBJECT,
            description: "Bounding box coordinates 0-1. Only applicable if identifying specific objects in a static image.",
            properties: {
              ymin: { type: Type.NUMBER },
              xmin: { type: Type.NUMBER },
              ymax: { type: Type.NUMBER },
              xmax: { type: Type.NUMBER }
            }
          }
        },
        required: ["id", "name", "category", "carbonFootprint", "impactDescription", "suggestion"]
      }
    }
  },
  required: ["summary", "mainCategory", "totalCarbonScore", "items", "generalTips"]
};

export const analyzeMedia = async (file: File | Blob, mimeType: string): Promise<AnalysisResult> => {
  let parts: any[] = [];

  if (mimeType === 'text/plain') {
      const text = await file.text();
      parts.push({ text: `User Activity Description: "${text}"` });
  } else if (file instanceof File) {
      const part = await fileToGenerativePart(file);
      parts.push(part);
  } else {
     // Handle Blob (e.g., from audio recording)
     const b64 = await blobToBase64(file);
     parts.push({
         inlineData: {
             data: b64,
             mimeType: mimeType
         }
     });
  }

  const promptText = `
    Analyze this input (image, video, audio, or text description) for environmental impact. 
    You are an expert Eco-Impact Analyzer.
    
    1. Classify the activity into one of: Waste (recycling/trash), Transport (commute/travel), Food (meals/diet), Energy (electronics/lights), or Lifestyle.
    2. If it's waste: Identify items, recyclability.
    3. If it's transport/food/energy: Analyze the activity and estimate impact based on standard emission factors.
    
    Provide a carbon footprint estimate (0-100 scale where 100 is bad).
    For images, provide bounding boxes for distinct items if possible.
  `;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful, encouraging sustainability expert. Be precise but friendly.",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateEcoVisualization = async (summary: string, score: number): Promise<string> => {
  const prompt = `
    Create a stunning 3D isometric diorama visualization representing this activity: "${summary}".
    The image should abstractly represent the carbon footprint impact in a "digital collectible" style.
    Carbon Impact Score: ${score}/100 (Lower is better).
    
    Visual Style: High-quality 3D render, isometric view, claymorphism, soft studio lighting, minimalist.
    
    If the score is low (0-30): Show a floating island with vibrant lush greenery, trees, clear water, blooming flowers, birds.
    If the score is moderate (31-69): A balance of clean technology, electric infrastructure, wind turbines, and some nature.
    If the score is high (70-100): A darker industrial platform with smoke, waste piles, red warning lights, but artistically rendered.
    
    The background should be a solid, soft color to match the mood. Make it look like a premium 3D icon.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Visualization Generation Error:", error);
    throw error;
  }
};
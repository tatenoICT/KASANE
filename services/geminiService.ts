
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeLendingReason = async (reason: string) => {
  if (!process.env.API_KEY) return null;

  try {
    // Create client instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `以下の端末利用理由を分析し、緊急度と短い要約、雰囲気を抽出してください: "${reason}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, description: "ポジティブ、ニュートラル、ネガティブなど" },
            urgency: { type: Type.STRING, description: "high, normal, low のいずれか" },
            summary: { type: Type.STRING, description: "15文字程度の短い要約" },
          },
          required: ["sentiment", "urgency", "summary"],
        },
      },
    });

    // Directly access the text property
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const generateStatusInsight = async (devices: any[]) => {
  if (!process.env.API_KEY) return "AI分析は現在利用できません。";

  try {
    const borrowedCount = devices.filter(d => d.status === 'borrowed').length;
    const totalCount = devices.length;
    
    // Create client instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `現在の貸出状況（貸出中 ${borrowedCount}台 / 全体 ${totalCount}台）に基づき、管理者への一言アドバイスを生成してください。`,
    });

    // Directly access the text property
    return response.text || "状況を把握しました。";
  } catch (error) {
    return "状況を把握しました。";
  }
};

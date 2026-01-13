
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCopyStrategy = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Atue como um Copywriter Senior focado em Direct Response. Gere uma estrutura de persuasão ou VSL baseada no seguinte: ${prompt}`,
    config: {
      temperature: 0.8,
    }
  });
  return response.text;
};

export const handleSalesObjection = async (objection: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Você é Brenner, um consultor de vendas mestre. Um prospect disse: "${objection}". Forneça 3 scripts rápidos para superar essa objeção focando em ROI e autoridade da Rodrigues Growth Partners.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const analyzeFinanceData = async (data: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise estes KPIs financeiros e dê insights de escala e contenção de gastos para uma agência de tráfego pago: ${data}`,
    config: {
      temperature: 0.2,
    }
  });
  return response.text;
};

import { GoogleGenAI } from "@google/genai";

// Tenta pegar a chave com prefixo VITE_ (obrigatório no Vite/Vercel)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const getAI = () => {
  if (!apiKey) {
    console.error("ERRO CRÍTICO: Chave de API não encontrada! Verifique o .env ou a Vercel.");
    throw new Error("API Key ausente");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Módulo Dante (Copy) ---
export const generateCopyStrategy = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Mudei para 1.5 (Estável)
      contents: `Atue como Dante, Copywriter Senior da RGP. Crie uma estrutura de copy para: "${prompt}". Use Markdown.`,
      config: { temperature: 0.8 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Dante:", error);
    throw error;
  }
};

// --- Módulo Brenner (Vendas) ---
export const handleSalesObjection = async (objection: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Mudei para 1.5 (Estável)
      contents: `Atue como Brenner. O lead disse: "${objection}". Dê 3 respostas curtas para quebrar essa objeção.`,
      config: { temperature: 0.7 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Brenner:", error);
    throw error;
  }
};

// --- Módulo Sofia (Financeiro) ---
export const analyzeFinanceData = async (data: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Mudei para 1.5 (Estável)
      contents: `Atue como Sofia. Analise estes dados financeiros e dê insights: ${data}`,
      config: { temperature: 0.3 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Sofia:", error);
    throw error;
  }
};

// --- Módulo Rubens (Criativos) ---
export const generateCreativeIdeas = async (clientName: string, niche: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Mudei para 1.5 (Estável)
      contents: `Atue como Rubens, Diretor de Criação.
      Cliente: ${clientName} | Nicho: ${niche}
      Gere 3 ideias de criativos virais (Reels/TikTok) com Headline e Descrição Visual.`,
      config: { temperature: 0.9 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Rubens Detalhado:", error); 
    throw error; // Lança o erro para o console do navegador
  }
};

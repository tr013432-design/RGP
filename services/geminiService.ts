import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const getModel = () => {
  if (!apiKey) {
    console.error("ERRO: API Key ausente. Verifique o .env na Vercel.");
    throw new Error("API Key ausente");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // CORREÇÃO APLICADA:
  // Trocamos 'gemini-pro' (descontinuado/instável) por 'gemini-1.5-flash'.
  // O Flash é mais rápido e ideal para gerar respostas curtas (Rubens/Brenner).
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const generateCopyStrategy = async (prompt: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`Atue como Dante (Copywriter). Crie uma copy para: "${prompt}"`);
    return result.response.text();
  } catch (error) {
    console.error("Erro Dante:", error);
    return "Erro ao gerar copy. Verifique conexão.";
  }
};

export const handleSalesObjection = async (objection: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`Atue como Brenner (Vendas). Quebre a objeção: "${objection}"`);
    return result.response.text();
  } catch (error) {
    console.error("Erro Brenner:", error);
    return "Erro ao gerar script.";
  }
};

export const analyzeFinanceData = async (data: string) => {
  try {
    const model = getModel();
    // Dica: Para a Sofia, se precisar de análise de planilhas complexas no futuro,
    // podemos criar um getModel específico usando 'gemini-1.5-pro'.
    const result = await model.generateContent(`Atue como Sofia (Financeiro). Analise: ${data}`);
    return result.response.text();
  } catch (error) {
    console.error("Erro Sofia:", error);
    return "Erro na análise.";
  }
};

export const generateCreativeIdeas = async (clientName: string, niche: string) => {
  try {
    const model = getModel();
    // Prompt do Rubens
    const result = await model.generateContent(`
      Atue como Rubens (Criativo).
      Cliente: ${clientName} | Nicho: ${niche}.
      Gere 3 ideias curtas de Reels/TikTok.
    `);
    return result.response.text();
  } catch (error) {
    console.error("Erro Rubens Detalhado:", error);
    throw error;
  }
};

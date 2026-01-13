import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Função auxiliar para tentar pegar o modelo, com fallback (plano B)
const getGenerativeModel = (genAI: GoogleGenerativeAI) => {
  try {
    // TENTATIVA 1: O modelo específico e exato (versão 001)
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
  } catch (e) {
    console.warn("Flash falhou, tentando Gemini Pro...");
    // TENTATIVA 2: O modelo clássico (mais estável)
    return genAI.getGenerativeModel({ model: "gemini-pro" });
  }
};

const getModel = () => {
  if (!apiKey) {
    console.error("ERRO: API Key ausente. Verifique o .env na Vercel.");
    throw new Error("API Key ausente");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return getGenerativeModel(genAI);
};

export const generateCopyStrategy = async (prompt: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`Atue como Dante (Copywriter). Crie uma copy para: "${prompt}"`);
    return result.response.text();
  } catch (error) {
    console.error("Erro Dante:", error);
    return "Erro ao gerar copy. (Dante)";
  }
};

export const handleSalesObjection = async (objection: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`Atue como Brenner (Vendas). Quebre a objeção: "${objection}"`);
    return result.response.text();
  } catch (error) {
    console.error("Erro Brenner:", error);
    return "Erro ao gerar script. (Brenner)";
  }
};

export const analyzeFinanceData = async (data: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`Atue como Sofia (Financeiro). Analise: ${data}`);
    return result.response.text();
  } catch (error) {
    console.error("Erro Sofia:", error);
    return "Erro na análise. (Sofia)";
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
    // Se der erro aqui, vamos tentar um erro mais legível
    throw new Error("Falha na conexão com a IA (Rubens). Tente novamente.");
  }
};

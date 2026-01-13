import { GoogleGenerativeAI } from "@google/generative-ai";

// Tenta pegar a chave. Se não achar, usa string vazia para não quebrar o build,
// mas vai dar erro no console se tentar usar.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const getModel = () => {
  if (!apiKey) {
    console.error("ERRO: Chave de API não encontrada. Verifique as Variáveis de Ambiente na Vercel.");
    throw new Error("API Key ausente");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // O modelo 'gemini-1.5-flash' é o mais estável para essa biblioteca
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// --- Módulo Dante (Copy) ---
export const generateCopyStrategy = async (prompt: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`
      Atue como Dante, Copywriter Senior da RGP.
      Contexto: A agência preza por copy agressiva e baseada em dados.
      Tarefa: Crie uma estrutura de persuasão para: "${prompt}".
      Formato: Use Markdown, separe por tópicos.
    `);
    return result.response.text();
  } catch (error) {
    console.error("Erro Dante:", error);
    return "Erro ao gerar copy. Verifique a chave de API.";
  }
};

// --- Módulo Brenner (Vendas) ---
export const handleSalesObjection = async (objection: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`
      Atue como Brenner, especialista em negociação.
      Objeção do cliente: "${objection}".
      Dê 3 respostas curtas para quebrar essa objeção.
    `);
    return result.response.text();
  } catch (error) {
    console.error("Erro Brenner:", error);
    return "Erro ao gerar script.";
  }
};

// --- Módulo Sofia (Financeiro) ---
export const analyzeFinanceData = async (data: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(`
      Atue como Sofia, analista financeira.
      Analise estes dados e dê insights curtos: ${data}
    `);
    return result.response.text();
  } catch (error) {
    console.error("Erro Sofia:", error);
    return "Erro na análise.";
  }
};

// --- Módulo Rubens (Criativos) ---
export const generateCreativeIdeas = async (clientName: string, niche: string) => {
  try {
    const model = getModel();
    const prompt = `
      Atue como Rubens, Diretor de Criação.
      Cliente: ${clientName} | Nicho: ${niche}
      Gere 3 ideias de criativos virais (Reels/TikTok) com Headline e Descrição.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Erro Rubens:", error);
    throw error;
  }
};

import { GoogleGenAI } from "@google/genai";

// Pega a chave configurada no vite.config.ts / .env.local
// Nota: O Vite expõe variáveis via import.meta.env, mas sua config mapeou para process.env
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const getAI = () => {
  if (!apiKey) {
    console.error("ALERTA: API Key do Gemini não encontrada. Verifique o .env.local");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Módulo Dante (Copy) ---
export const generateCopyStrategy = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Modelo mais rápido e atual
      contents: `Atue como Dante, Copywriter Senior da Rodrigues Growth Partners. 
      Contexto: A agência preza por copy agressiva e baseada em dados.
      Tarefa: Crie uma estrutura de persuasão para o seguinte pedido: "${prompt}".
      Formato: Use Markdown, separe por tópicos e inclua sugestões de gatilhos mentais.`,
      config: { temperature: 0.8 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Dante AI:", error);
    return "O Dante está offline no momento. Verifique sua conexão ou a chave API.";
  }
};

// --- Módulo Brenner (Vendas) ---
export const handleSalesObjection = async (objection: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Atue como Brenner, especialista em negociação B2B.
      O prospect lançou a objeção: "${objection}".
      Forneça 3 opções de resposta curta (Script de Quebra de Objeção):
      1. Uma resposta empática e lógica.
      2. Uma resposta agressiva (Challenger Sale).
      3. Uma pergunta para aprofundar a dor.`,
      config: { temperature: 0.7 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Brenner AI:", error);
    return "Erro ao processar objeção.";
  }
};

// --- Módulo Sofia (Financeiro) ---
export const analyzeFinanceData = async (data: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Atue como Sofia, analista financeira fria e calculadora.
      Analise este JSON de dados financeiros da agência: ${data}
      Identifique: 1. Padrões de risco. 2. Oportunidades de otimização de lucro.
      Seja direta e use bullet points.`,
      config: { temperature: 0.3 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Sofia AI:", error);
    return "Erro na análise de dados.";
  }
};

// --- Módulo Rubens (Criativos) - NOVO! ---
export const generateCreativeIdeas = async (clientName: string, niche: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Atue como Rubens, Diretor de Criação.
      Cliente: ${clientName}
      Nicho: ${niche}
      Tarefa: Gere 3 ideias de criativos virais (Reels/TikTok).
      Para cada ideia inclua: 
      - Headline Visual (Texto na tela)
      - Descrição da Cena
      - Áudio Sugerido (Trending)`,
      config: { temperature: 0.9 }
    });
    return response.text();
  } catch (error) {
    console.error("Erro Rubens AI:", error);
    return "Erro ao gerar ideias criativas.";
  }
};

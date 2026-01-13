const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Função Manual de Conexão (Sem usar biblioteca)
const callGeminiDirect = async (prompt: string, role: string) => {
  if (!apiKey) {
    console.error("ERRO: API Key ausente.");
    return "Erro: Chave de API não configurada.";
  }

  // URL direta da API do Google (bypassando a biblioteca)
  // Usando o modelo gemini-1.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `Atue como ${role}. ${prompt}`
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Se der erro, vamos ver o detalhe real no console
      const errorData = await response.json();
      console.error("ERRO DETALHADO DO GOOGLE:", errorData);
      throw new Error(`Erro API: ${response.status}`);
    }

    const data = await response.json();
    // Extraindo o texto da resposta complexa do Google
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Erro na chamada manual:", error);
    return "Erro de conexão com a IA. Verifique o console (F12) para detalhes.";
  }
};

// --- Funções Exportadas (Mantendo os mesmos nomes para não quebrar o resto do site) ---

export const generateCopyStrategy = async (prompt: string) => {
  return await callGeminiDirect(`Crie uma copy para: "${prompt}"`, "Dante (Copywriter)");
};

export const handleSalesObjection = async (objection: string) => {
  return await callGeminiDirect(`Quebre a objeção: "${objection}"`, "Brenner (Vendas)");
};

export const analyzeFinanceData = async (data: string) => {
  return await callGeminiDirect(`Analise estes dados: ${data}`, "Sofia (Financeiro)");
};

export const generateCreativeIdeas = async (clientName: string, niche: string) => {
  const prompt = `Cliente: ${clientName} | Nicho: ${niche}. Gere 3 ideias curtas de Reels/TikTok.`;
  return await callGeminiDirect(prompt, "Rubens (Criativo)");
};

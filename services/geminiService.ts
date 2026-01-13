// --- ÁREA DE PERIGO: HARDCODE TEMPORÁRIO ---
// Cole sua chave nova (que começa com AIza) entre as aspas abaixo.
const apiKey = "AIzaSyD8JX8cgAJ1GfgxbFZKrvUYwMcJa-Ot4JU"; 
// -------------------------------------------

const callGeminiDirect = async (prompt: string, role: string) => {
  if (!apiKey || apiKey === "AIzaSyD8JX8cgAJ1GfgxbFZKrvUYwMcJa-Ot4JU") {
    console.error("ERRO: Você esqueceu de colar a chave nova no código!");
    return "Erro: Chave não inserida no código.";
  }

  // Vamos usar o modelo Flash 1.5 que é o padrão atual
  const model = "gemini-1.5-flash"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
      const errorData = await response.json();
      console.error("ERRO DO GOOGLE:", errorData);
      
      // Se der erro 404 aqui com a chave certa, é problema de permissão no Google
      return `Erro API Google: ${errorData.error?.message || response.status}`;
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Erro na chamada:", error);
    return "Erro de conexão. Verifique o console.";
  }
};

// --- Exportações ---
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

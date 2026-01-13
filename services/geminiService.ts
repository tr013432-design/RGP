// --- CÓDIGO DE DIAGNÓSTICO (COM ALERTA DE ERRO) ---

// 1. Cole sua chave aqui dentro das aspas
const apiKey = "AIzaSyD8JX8cgAJ1GfgXbFZKrvUYWMcJa-Ot4JU"; 

const callGeminiDirect = async (prompt: string, role: string) => {
  // CONFIGURAÇÃO: Usando modelo Flash 1.5
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
      // AQUI ESTÁ A MÁGICA: Vamos pegar o erro real
      const errorData = await response.json();
      const mensagemErro = errorData.error?.message || JSON.stringify(errorData);
      
      console.error("ERRO DO GOOGLE:", errorData);
      
      // ISSO VAI MOSTRAR UM POP-UP NA SUA TELA COM O PROBLEMA
      alert(`O GOOGLE RECUSOU A CONEXÃO:\n\n${mensagemErro}`);
      
      return `Erro API: ${mensagemErro}`;
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Erro na chamada:", error);
    alert("Erro de conexão (Internet ou Bloqueio): " + error);
    return "Erro de conexão.";
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

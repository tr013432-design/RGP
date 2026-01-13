const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const callGeminiDirect = async (prompt: string, role: string) => {
  if (!apiKey) return "Erro: API Key não configurada.";

  // Vamos tentar 3 modelos em ordem: Flash (Rápido) -> Pro 1.5 (Forte) -> Pro 1.0 (Antigo/Estável)
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro", 
    "gemini-pro"
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Atue como ${role}. ${prompt}` }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } else {
        // Se falhar, apenas loga e tenta o próximo
        console.warn(`Falha no modelo ${model}: ${response.status}`);
      }
    } catch (e) {
      console.error(`Erro de conexão com ${model}`, e);
    }
  }

  return "Erro Fatal: Nenhum modelo funcionou. Verifique se sua API Key foi criada em 'aistudio.google.com' num projeto NOVO.";
};

// --- Exportações ---
export const generateCopyStrategy = async (prompt: string) => callGeminiDirect(`Copy para: "${prompt}"`, "Dante");
export const handleSalesObjection = async (objection: string) => callGeminiDirect(`Quebre a objeção: "${objection}"`, "Brenner");
export const analyzeFinanceData = async (data: string) => callGeminiDirect(`Analise: ${data}`, "Sofia");
export const generateCreativeIdeas = async (clientName: string, niche: string) => callGeminiDirect(`3 ideias de Reels para ${clientName} (${niche})`, "Rubens");

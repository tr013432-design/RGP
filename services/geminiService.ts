type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: {
    message?: string;
  };
};

const callGemini = async (prompt: string, role: string): Promise<string> => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, role })
  });

  if (!response.ok) {
    throw new Error("Erro ao chamar a API interna");
  }

  const data: GeminiResponse = await response.json();

  // 🛑 Tratamento de erro do Gemini
  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Resposta vazia do Gemini");
  }

  return text;
};

// =====================
// EXPORTAÇÕES
// =====================

export const generateCopyStrategy = async (prompt: string) =>
  await callGemini(prompt, "Dante (Copywriter)");

export const handleSalesObjection = async (objection: string) =>
  await callGemini(objection, "Brenner (Vendas)");

export const analyzeFinanceData = async (data: string) =>
  await callGemini(data, "Sofia (Financeiro)");

export const generateCreativeIdeas = async (client: string, niche: string) =>
  await callGemini(
    `Cliente: ${client} | Nicho: ${niche}. Gere 3 ideias de Reels.`,
    "Rubens (Criativo)"
  );

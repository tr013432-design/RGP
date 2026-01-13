const callGemini = async (prompt: string, role: string) => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, role })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// Exportações
export const generateCopyStrategy = (prompt: string) =>
  callGemini(prompt, "Dante (Copywriter)");

export const handleSalesObjection = (objection: string) =>
  callGemini(objection, "Brenner (Vendas)");

export const analyzeFinanceData = (data: string) =>
  callGemini(data, "Sofia (Financeiro)");

export const generateCreativeIdeas = (client: string, niche: string) =>
  callGemini(
    `Cliente: ${client} | Nicho: ${niche}. Gere 3 ideias de Reels.`,
    "Rubens (Criativo)"
  );

export const callAI = async (prompt: string, role: string) => {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, role }),
  });

  if (!response.ok) {
    throw new Error("Erro ao chamar IA");
  }

  const data = await response.json();
  return data.text;
};

// Especializações
export const generateCopyStrategy = (prompt: string) =>
  callAI(prompt, "Dante (Copywriter)");

export const handleSalesObjection = (objection: string) =>
  callAI(objection, "Brenner (Vendas)");

export const analyzeFinanceData = (data: string) =>
  callAI(data, "Sofia (Financeiro)");

export const generateCreativeIdeas = (client: string, niche: string) =>
  callAI(
    `Cliente: ${client} | Nicho: ${niche}. Gere 3 ideias de Reels.`,
    "Rubens (Criativo)"
  );

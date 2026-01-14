export const callAI = async (prompt: string, role: string) => {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, role }),
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Resposta inválida:", text);
    throw new Error("Erro interno da API");
  }

  if (!res.ok) {
    throw new Error(data.error || "Erro desconhecido");
  }

  return data.text;
};

// 🔥 EXPORTA O QUE OS MÓDULOS USAM
export const analyzeFinanceData = (data: string) =>
  callAI(data, "Sofia (Financeiro)");

export const handleSalesObjection = (objection: string) =>
  callAI(objection, "Brenner (Vendas)");

export const generateCopyStrategy = (prompt: string) =>
  callAI(prompt, "Dante (Copywriter)");

export const generateCreativeIdeas = (client: string, niche: string) =>
  callAI(
    `Cliente: ${client} | Nicho: ${niche}. Gere 3 ideias de Reels.`,
    "Rubens (Criativo)"
  );

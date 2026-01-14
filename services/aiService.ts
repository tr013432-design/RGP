// src/services/aiService.ts

export const callAI = async (prompt: string, role: string) => {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, role }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Erro da API:", data);
    throw new Error(data.error || "Erro desconhecido");
  }

  return data.text;
};

/* =========================
   FUNÇÕES USADAS PELOS MÓDULOS
========================= */

export const analyzeFinanceData = (data: string) =>
  callAI(
    `Analise os seguintes dados financeiros e gere insights estratégicos:\n${data}`,
    "Sofia (Financeiro)"
  );

export const handleSalesObjection = (objection: string) =>
  callAI(
    `O cliente disse: "${objection}". Gere uma resposta persuasiva.`,
    "Brenner (Vendas)"
  );

export const generateCopyStrategy = (prompt: string) =>
  callAI(
    `Crie uma estratégia de copywriting profissional para:\n${prompt}`,
    "Dante (Copywriter)"
  );

export const generateCreativeIdeas = (client: string, niche: string) =>
  callAI(
    `Cliente: ${client}\nNicho: ${niche}\nGere 3 ideias de Reels criativos.`,
    "Rubens (Criativo)"
  );

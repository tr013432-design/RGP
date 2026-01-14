// services/aiService.ts

async function callAI(message: string): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("API ERROR:", data);
    throw new Error(data?.error || "Falha ao chamar /api/ai");
  }

  return (data.reply ?? "") as string;
}

/** SOFIA — financeiro */
export async function analyzeFinanceData(financeDataJson: string) {
  const prompt = `
Você é a Sofia, uma analista financeira sênior.
Analise os dados abaixo e gere insights curtos e práticos:
- tendências de receita vs gastos
- alertas (ex: gastos subindo mais que receita)
- 3 ações recomendadas para melhorar margem/ROI
Responda em PT-BR, objetivo e direto.

DADOS (JSON):
${financeDataJson}
`.trim();

  return callAI(prompt);
}

/** BRENNER — vendas/objeções */
export async function handleSalesObjection(objection: string) {
  const prompt = `
Você é o Brenner, especialista em vendas consultivas.
Crie um script de resposta para a objeção: "${objection}"

Regras:
- Tom profissional e persuasivo
- 3 variações de resposta (curta / média / agressiva)
- Inclua 1 pergunta de qualificação no final
- Use bullets e seja bem aplicável no WhatsApp
`.trim();

  return callAI(prompt);
}

/** DANTE — copy/estratégia */
export async function generateCopyStrategy(context: string) {
  const prompt = `
Você é o Dante, estrategista de copywriting.
Com base no contexto abaixo, gere:
1) Estrutura sugerida
2) Hooks (5)
3) Promessa principal
4) Provas/argumentos (5)
5) CTA forte (3 opções)

Contexto:
${context}

Responda em PT-BR e formate em tópicos.
`.trim();

  return callAI(prompt);
}

/** RUBENS — criativos/ideias */
export async function generateCreativeIdeas(clientOrNiche: string, goal: string = "Geral") {
  const prompt = `
Você é o Rubens, diretor criativo.
Gere 10 ideias de criativos (Reels/TikTok/Ads) para:

Cliente/Nicho: ${clientOrNiche}
Objetivo: ${goal}

Para cada ideia, traga:
- ângulo
- roteiro curto (3 a 6 linhas)
- CTA
- variação (A/B)

Responda em PT-BR e bem prático.
`.trim();

  return callAI(prompt);
}

/** (Opcional) Se você quiser usar sendMessage direto em algum lugar */
export async function sendMessage(message: string) {
  return callAI(message);
}

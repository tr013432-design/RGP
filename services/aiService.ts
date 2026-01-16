// services/aiService.ts

interface AIConfig {
  max_tokens?: number;
  temperature?: number;
}

// Atualizei a função para aceitar configurações extras (como tamanho do texto)
async function callAI(message: string, config?: AIConfig): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, config }), // Enviamos a config para o servidor
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
Você é a Sofia, uma analista financeira sênior focada em Growth e ROI.
Analise os dados financeiros abaixo e gere um relatório executivo:

1. **Diagnóstico Rápido**: Tendência de Receita vs Gastos (use setas ▲▼).
2. **Alertas Vermelhos**: Onde estamos sangrando dinheiro? (Se houver).
3. **Plano de Ação**: 3 ações táticas para aumentar a Margem Líquida imediatamente.

Mantenha um tom frio, analítico e direto ao ponto. Use Markdown para formatar (negrito, tabelas se necessário).

DADOS (JSON):
${financeDataJson}
`.trim();

  // Sofia precisa de precisão (temperatura baixa) e tamanho médio
  return callAI(prompt, { temperature: 0.2, max_tokens: 1000 });
}

/** BRENNER — vendas/objeções */
export async function handleSalesObjection(objection: string) {
  const prompt = `
Você é o Brenner, um closer de vendas agressivo e especialista em PNL.
O lead acabou de jogar a seguinte objeção na mesa: "${objection}"

Sua missão é contornar isso e fechar a venda. Gere:

1. **Análise Psicológica**: O que ele realmente quis dizer? (1 frase).
2. **Script 1 (Empático/Consultivo)**: Para quebrar o gelo.
3. **Script 2 (Desafiador/Challenger)**: Para retomar autoridade.
4. **Script 3 (Agressivo/Closer)**: O "vai ou racha".
5. **Pergunta de Trava**: Uma pergunta final que impede ele de dar desculpas.

Use tom conversacional de WhatsApp.
`.trim();

  return callAI(prompt, { temperature: 0.7, max_tokens: 1500 });
}

/** DANTE — copy/estratégia */
export async function generateCopyStrategy(context: string) {
  const prompt = `
Você é o Dante, um copywriter de elite especializado em resposta direta e VSLs.
Com base no contexto do cliente abaixo, construa uma **Estratégia de Copywriting Completa**:

CONTEXTO:
${context}

---
ESTRUTURA DE RESPOSTA (Use Markdown rico):

# 1. Big Idea & Mecanismo Único
Defina o conceito central e o nome do "Mecanismo Único" que diferencia essa oferta.

# 2. Hooks Poderosos (5 Variações)
Crie 5 ganchos iniciais focados em curiosidade e quebra de padrão.

# 3. A Promessa (One Big Promise)
Uma única frase forte que resume a transformação.

# 4. Blocos de Persuasão (Bulleted List)
- 5 argumentos lógicos/emocionais para matar objeções.
- Provas sociais sugeridas.

# 5. Oferta Irresistível & CTAs
Como empacotar o preço e 3 opções de Chamada para Ação (CTA).

Responda em PT-BR. Não economize palavras, entregue a estratégia completa.
`.trim();

  // AQUI ESTÁ O SEGREDO: Pedimos 3000 tokens para o Dante ter espaço para escrever tudo
  return callAI(prompt, { temperature: 0.8, max_tokens: 3000 });
}

/** RUBENS — criativos/ideias */
export async function generateCreativeIdeas(clientOrNiche: string, goal: string = "Geral") {
  const prompt = `
Você é o Rubens, estrategista de criativos de alta conversão para TikTok/Reels.
Gere 10 ideias de vídeos virais para:

Cliente/Nicho: ${clientOrNiche}
Objetivo Atual: ${goal}

Formato de cada ideia:
**Ideia [N]**: [Nome do Conceito]
- **Visual**: O que aparece na tela nos primeiros 3s.
- **Hook (Áudio/Texto)**: A frase exata para prender a atenção.
- **Roteiro Resumido**: O desenrolar da ação.
- **CTA**: Chamada final.

Seja criativo e fuja do óbvio.
`.trim();

  return callAI(prompt, { temperature: 0.9, max_tokens: 2000 });
}

export async function sendMessage(message: string) {
  return callAI(message);
}

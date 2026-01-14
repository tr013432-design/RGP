const callGemini = async (prompt: string, role: string) => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, role })
  });

  const data = await response.json();

  // Se a API respondeu erro
  if (!response.ok) {
    console.error("Erro da API Gemini:", data);
    throw new Error(data.error || "Erro ao chamar a API interna");
  }

  // Retorno seguro
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Nenhuma resposta gerada."
  );
};

export const generateCreativeIdeas = (client: string, niche: string) =>
  callGemini(
    `Cliente: ${client}. Nicho: ${niche}. Gere 3 ideias de Reels.`,
    "Rubens (Criativo)"
  );

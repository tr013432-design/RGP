export const callAI = async (prompt: string, role: string) => {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, role }),
  });

  // 👇 Lê como TEXTO primeiro
  const text = await res.text();

  // 👇 Tenta converter para JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Resposta não-JSON da API:", text);
    throw new Error("Erro interno da API (resposta inválida)");
  }

  if (!res.ok) {
    console.error("Erro da API:", data);
    throw new Error(data.error || "Erro desconhecido");
  }

  return data.text;
};

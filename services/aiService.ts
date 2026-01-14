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

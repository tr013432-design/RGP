export async function sendMessage(message: string) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("API ERROR:", data);
    throw new Error(data?.error || "Falha ao chamar /api/ai");
  }

  return data.reply as string;
}

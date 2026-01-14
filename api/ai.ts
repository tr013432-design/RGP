export default async function handler(req: any, res: any) {
  // CORS básico (ajuda quando dá erro em produção)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing 'message'" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not set on server" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENAI API ERROR:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed",
        details: data,
      });
    }

    const reply = data?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("SERVER ERROR:", err?.message || err);
    return res.status(500).json({ error: "Erro interno da API" });
  }
}

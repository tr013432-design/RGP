export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-goog-api-key");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing 'message'" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set on server" });

    const model = process.env.GEMINI_MODEL || "models/gemini-2.0-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("GEMINI API ERROR:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini request failed",
        details: data,
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") ?? "";

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("SERVER ERROR:", err?.message || err);
    return res.status(500).json({ error: "Erro interno da API" });
  }
}

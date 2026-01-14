export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing 'message'" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set on server" });

    // Endpoint oficial do Gemini Developer API (GenerateContent)
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }],
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

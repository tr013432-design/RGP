import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "API key ausente" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { prompt, role } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: role },
        { role: "user", content: prompt },
      ],
    });

    return res.status(200).json({
      text: completion.choices[0].message.content,
    });

  } catch (err: any) {
    console.error("ERRO OPENAI:", err);
    return res.status(500).json({
      error: "Falha ao gerar resposta",
      details: err.message,
    });
  }
}

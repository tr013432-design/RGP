import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY não configurada" });
    }

    const { prompt, role } = req.body;

    if (!prompt || !role) {
      return res.status(400).json({ error: "Prompt ou role ausente" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: role,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return res.status(200).json({
      text: response.output_text,
    });

  } catch (err: any) {
    console.error("ERRO OPENAI:", err);
    return res.status(500).json({
      error: "Falha ao gerar resposta",
      details: err.message,
    });
  }
}

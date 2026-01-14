import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, role } = req.body;

    if (!prompt || !role) {
      return res.status(400).json({ error: "Prompt ou role ausente" });
    }

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
  } catch (error: any) {
    console.error("OPENAI ERROR:", error);

    return res.status(500).json({
      error: "Erro ao gerar resposta",
      details: error.message,
    });
  }
}

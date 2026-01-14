import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key não configurada" }),
      { status: 500 }
    );
  }

  const body = await req.json();
  const { prompt, role } = body;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Atue como ${role}. ${prompt}` }]
        }]
      })
    }
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}

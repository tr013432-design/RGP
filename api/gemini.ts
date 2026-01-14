export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  // 🔐 Lê a chave
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key não configurada" }),
      { status: 500 }
    );
  }

  // 🧪 TESTE DIRETO NO NAVEGADOR (GET)
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "API Gemini OK 🚀" }),
      { status: 200 }
    );
  }

  // 🚨 Só aceita POST a partir daqui
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405 }
    );
  }

  const { prompt, role } = await req.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `Atue como ${role}. ${prompt}` }]
          }
        ]
      })
    }
  );

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

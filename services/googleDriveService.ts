// src/services/googleDriveService.ts

// OBS: Você deve colocar seu Client ID aqui ou no .env
const CLIENT_ID = "464694337692-b59b61n80icfqnm3usc3jc19l2v7gra7.apps.googleusercontent.com.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

/**
 * Função para criar um arquivo de texto no Google Drive
 */
export async function uploadToDrive(accessToken: string, fileName: string, content: string) {
  const metadata = {
    name: fileName, // Nome do arquivo (ex: Script_Vendas.txt)
    mimeType: "text/plain", // Tipo do arquivo
  };

  // Prepara o conteúdo do arquivo
  const fileContent = new Blob([content], { type: "text/plain" });
  const form = new FormData();

  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", fileContent);

  try {
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data; // Retorna os dados do arquivo criado (ID, link, etc)
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
}

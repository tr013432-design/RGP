// src/services/googleDriveService.ts

export async function uploadToDrive(accessToken: string, fileName: string, content: string) {
  const metadata = {
    name: fileName,
    mimeType: "text/plain",
  };

  const fileContent = new Blob([content], { type: "text/plain" });
  const form = new FormData();

  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", fileContent);

  try {
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
}

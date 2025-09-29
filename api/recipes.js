// Arquivo: /api/recipes.js

export default async function handler(request, response) {
  // --- INÍCIO DO CÓDIGO DE DEBUG ---
  // Vamos pedir para a função imprimir nos logs o que ela está recebendo.
  console.log("--- DEBUGANDO VARIÁVEIS DE AMBIENTE ---");
  console.log("API_ID recebido:", process.env.API_ID);
  console.log("API_KEY recebido (primeiros 5 chars):", process.env.API_KEY?.substring(0, 5)); // Por segurança, nunca exibimos a chave completa.
  console.log("USER_ID recebido:", process.env.USER_ID);
  console.log("--- FIM DO DEBUG ---");
  // --- FIM DO CÓDIGO DE DEBUG ---

  const API_ID = process.env.API_ID;
  const API_KEY = process.env.API_KEY;
  const USER_ID = process.env.USER_ID;

  const queryString = request.url.split('?')[1];
  const edamamURL = `https://api.edamam.com/api/recipes/v2?${queryString}`;

  try {
    const apiResponse = await fetch(edamamURL, {
      method: 'GET',
      headers: {
        'Edamam-Account-User': USER_ID,
        'Accept': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      return response.status(apiResponse.status).json({ message: 'Erro na API da Edamam.' });
    }

    const data = await apiResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno no nosso servidor.' });
  }
}
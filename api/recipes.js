// Arquivo: /api/recipes.js

export default async function handler(request, response) {
  // Pega as chaves secretas que vamos configurar na Vercel
  const API_ID = process.env.API_ID;
  const API_KEY = process.env.API_KEY;
  const USER_ID = process.env.USER_ID;

  // Monta a URL da Edamam, repassando os parâmetros de busca (q, diet, etc.)
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
    // Retorna a resposta da Edamam para o nosso site
    return response.status(200).json(data);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno no nosso servidor.' });
  }
}


export default async function handler(request, response) {
  const API_ID = process.env.API_ID;
  const API_KEY = process.env.API_KEY;
  const USER_ID = process.env.USER_ID;

  // Pega os parâmetros da URL que o seu front-end enviou
  const queryString = request.url.split('?')[1];
  
  
  const edamamURL = `https://api.edamam.com/api/recipes/v2?${queryString}&app_id=${API_ID}&app_key=${API_KEY}`;

  try {
    const apiResponse = await fetch(edamamURL, {
      method: 'GET',
      headers: {
        'Edamam-Account-User': USER_ID,
        'Accept': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      
      const errorBody = await apiResponse.text();
      console.error("Erro da Edamam:", errorBody);
      return response.status(apiResponse.status).json({ message: `Erro na API da Edamam: ${errorBody}` });
    }

    const data = await apiResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    console.error("Erro interno:", error);
    return response.status(500).json({ message: 'Erro interno no nosso servidor.' });
  }
}

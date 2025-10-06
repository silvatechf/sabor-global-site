// Função auxiliar para chamar a API de tradução
async function translateTexts(texts, targetLang, apiKey) {
  if (!texts || texts.length === 0) {
    return [];
  }
  const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const response = await fetch(translateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      target: targetLang,
      format: 'text',
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    console.error('Erro na API de Tradução:', error);
    return texts; // Se a tradução falhar, retorna os textos originais
  }
  const data = await response.json();
  return data.data.translations.map(t => t.translatedText);
}

export default async function handler(request, response) {
  const API_ID = process.env.API_ID;
  const API_KEY = process.env.API_KEY;
  const USER_ID = process.env.USER_ID;
  const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

  const { id } = request.query;
  let edamamURL;

  if (id) {
    edamamURL = `https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=${API_ID}&app_key=${API_KEY}`;
  } else {
    const queryString = request.url.split('?')[1];
    edamamURL = `https://api.edamam.com/api/recipes/v2?${queryString}&app_id=${API_ID}&app_key=${API_KEY}`;
  }

  try {
    const apiResponse = await fetch(edamamURL, {
      method: 'GET',
      headers: { 'Edamam-Account-User': USER_ID, 'Accept': 'application/json' },
    });
    if (!apiResponse.ok) {
      throw new Error(`Erro na API da Edamam: ${apiResponse.statusText}`);
    }
    const data = await apiResponse.json();
    let recipeData = id ? data.recipe : data;

    if (id && GOOGLE_API_KEY && recipeData) {
      const textsToTranslate = [
        recipeData.label,
        ...recipeData.ingredientLines
      ];
      const translatedTexts = await translateTexts(textsToTranslate, 'pt', GOOGLE_API_KEY);
      recipeData.label = translatedTexts[0];
      recipeData.ingredientLines = translatedTexts.slice(1);
    }
    return response.status(200).json(recipeData);
  } catch (error) {
    console.error("Erro interno:", error);
    return response.status(500).json({ message: 'Erro interno no nosso servidor.' });
  }
}